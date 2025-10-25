
import { db } from "@/db";
import { minds, sessions } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generateAvatarUri } from "@/lib/create-avatar";
import { streamChat } from "@/lib/stream-chat";
import { StreamVideo } from "@/lib/stream-video";
import { CallEndedEvent, CallRecordingReadyEvent, CallSessionParticipantLeftEvent, CallSessionStartedEvent, CallTranscriptionReadyEvent, MessageNewEvent } from "@stream-io/node-sdk";
import { and, eq, not } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
    } else if (eventType === "message.new") {
        const event = payload as MessageNewEvent;

        const userId = event.user?.id;
        const channelId = event.channel_id;
        const text = event.message?.text;

        if (!userId || !channelId || !text) {
            return NextResponse.json({ error: "Required fields are missing" }, { status: 404 });
        }

        const [existingSession] = await db.select().from(sessions).where(and(
            eq(sessions.id, channelId),
            eq(sessions.status, "completed")
        ));

        if (!existingSession) {
            return NextResponse.json({ error: "Session was not found" }, { status: 404 });
        }

        const [existingMind] = await db.select().from(minds).where(
            eq(minds.id, existingSession.mindId)
        );

        if (!existingMind) {
            return NextResponse.json({ error: "Mind was not found" }, { status: 404 });
        }

        if (userId !== existingMind.id) {
            const instructions = `
                You are an AI assistant helping the user revisit a recently completed meeting.
                Below is a summary of the meeting, generated from the transcript:
                
                ${existingSession.summary}
                
                The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
                
                ${existingMind.instructions}
                
                The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
                Always base your responses on the meeting summary above.
                
                You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
                
                If the summary does not contain enough information to answer a question, politely let the user know.
                
                Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
            `;

            const channel = streamChat.channel("messaging", channelId);
            await channel.watch();

            const previousMessages = channel.state.messages.slice(-5).filter((msg) => 
                                        msg.text?.trim() !== "").map<ChatCompletionMessageParam>((message) => ({
                                            role: message.user?.id === existingMind.id ? "assistant" : "user",
                                            content: message.text || ""
                                        }));

            const aiResponse = await openAiClient.chat.completions.create({
                messages: [
                    { role: "system", content: instructions },
                    ...previousMessages,
                    { role: "user", content: text }
                ],
                model: "gpt-3.5-turbo-0125"
            });
            
            const aiResponseText = aiResponse.choices[0].message.content;

            if (!aiResponseText) {
                return NextResponse.json({ error: "No response from AI" }, { status: 500 });
            }

            const avatarUrl = generateAvatarUri({
                seed: existingMind.name,
                variant: "botttsNeutral"
            });

            streamChat.upsertUser({
                id: existingMind.id,
                name: existingMind.name,
                image: avatarUrl
            });

            channel.sendMessage({
                text: aiResponseText,
                user: {
                    id: existingMind.id,
                    name: existingMind.name,
                    image: avatarUrl
                }
            });
        }

    }

    return NextResponse.json({ status: "ok" })
}