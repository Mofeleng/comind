import { StreamTranscriptItem } from "@/modules/sessions/types";
import { inngest } from "./client";
import JSONL from "jsonl-parse-stringify";
import { db } from "@/db";
import { minds, sessions, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAgent, openai, TextMessage } from "@inngest/agent-kit";

const summarizer = createAgent({
  name: "Summarizer",
  system: `You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

### Notes
Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

Example:
#### Section Name
- Main point or demo shown here
- Another key insight or interaction
- Follow-up tool or explanation provided

#### Next Section
- Feature X automatically does Y
- Mention of integration with Z`.trim(),
model: openai({ model: "gpt-3.5-turbo", apiKey: process.env.OPENAI_API_KEY })
});

export const sessionsProcessing = inngest.createFunction(
  { id: "sessions/processing" },
  { event: "sessions/processing" },
  async ({ event, step }) => {
    const res = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((r) => r.text());
    });

    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptItem>(res);
    });

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id))
      ];

      const userSpeakers = await db.select().from(user).where(
        inArray(user.id, speakerIds)
      ).then((users) => users.map((user) => ({
        ...user
      })));

      const mindSpeakers = await db.select().from(minds).where(
        inArray(minds.id, speakerIds)
      ).then((minds) => minds.map((mind) => ({
        ...mind
      })));

      const speakers = [...userSpeakers, ...mindSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find((speaker) => speaker.id === item.speaker_id)

        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown"
            }
          }
        }

        return {
            ...item,
            user: {
              name: speaker.name
            }
          }
      });
    });

    const { output } = await summarizer.run(
      "Summarize the following transcript: " + JSON.stringify(transcriptWithSpeakers)
    );

    await step.run("save-summary", async () => {
      await db.update(sessions).set({
        summary: (output[0] as TextMessage).content as string,
        status: "completed"
      }).where(eq(sessions.id, event.data.sessionId))
    });
  },
)