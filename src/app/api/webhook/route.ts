
import { db } from "@/db";
import { minds, sessions } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamVideo } from "@/lib/stream-video";
import { CallEndedEvent, CallRecordingReadyEvent, CallSessionParticipantLeftEvent, CallSessionStartedEvent, CallTranscriptionReadyEvent } from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

function verifySignatureWithStream(body: string, signature: string):boolean {
    return StreamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json({ error: "Missing signature or API Key" }, { status: 400 });
    }

    const body = await req.text();
    if (!verifySignatureWithStream(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload:unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400});
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const sessionId = event.call.custom?.sessionId;
        
        if (!sessionId) {
            return NextResponse.json({ error: "Session not found"}, { status: 404 });
        }

        const [existingSession] = await db.select().from(sessions).where(and(
            eq(sessions.id, sessionId),
            not(eq(sessions.status, "completed")),
            not(eq(sessions.status, "active")),
            not(eq(sessions.status, "cancelled")),
            not(eq(sessions.status, "processing")),
        ));

        if (!existingSession) {
            return NextResponse.json({ error: "Session not found"}, { status: 404 });
        }

        await db.update(sessions).set({
            status: "active",
            startedAt: new Date()
        }).where(eq(sessions.id, existingSession.id));

        const [existingMind] = await db.select().from(minds).where(and(
            eq(minds.id, existingSession.mindId)
        ));

        if (!existingMind) {
            return NextResponse.json({ error: "Mind not found"}, { status: 404 });
        }

        const call = StreamVideo.video.call("default", sessionId);

        const realtimeClient = await StreamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: existingMind.id
        });

        realtimeClient.updateSession({
            instructions: existingMind.instructions
        })
    } else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const sessionId = event.call_cid.split(":")[1];

        if (!sessionId) {
            return NextResponse.json({ error: "Session not found"}, { status: 404 });
        }

        const call = StreamVideo.video.call("default", sessionId);
        await call.end();
    } else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const sessionId = event.call.custom?.sessionId;

        if (!sessionId) {
            return NextResponse.json({ error: "Session not found"}, { status: 404 });
        }

        await db.update(sessions).set({
            status: "processing",
            endedAt: new Date()
        }).where(and(
            eq(sessions.id, sessionId),
            eq(sessions.status, "active")
        ));
    } else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const sessionId = event.call_cid.split(":")[1];

        const [updatedSession] = await db.update(sessions).set({
            transcriptUrl: event.call_transcription.url
        }).where(eq(sessions.id, sessionId)).returning();

        //TODO: Call ingest bg job to summarise transcription
        if (!updatedSession) {
            return NextResponse.json({ error: "Session not found"}, { status: 404 });
        }

        await inngest.send({
            name: "sessions/processing",
            data: {
                sessionId: updatedSession.id,
                transcriptUrl: updatedSession.transcriptUrl
            }
        });
        
    } else if (eventType === "call.recording_ready") {
         const event = payload as CallRecordingReadyEvent;
        const sessionId = event.call_cid.split(":")[1];

        await db.update(sessions).set({
            recordingUrl: event.call_recording.url
        }).where(eq(sessions.id, sessionId))
    }

    return NextResponse.json({ status: "ok" })
}