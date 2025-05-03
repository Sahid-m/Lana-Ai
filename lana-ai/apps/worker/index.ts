import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import { prismaClient } from "db/client";
import express from "express";
import { onFileUpdate, onPromptEnd, onShellCommand } from "./os";
import { ArtifactProcessor } from "./parser";
import { systemPrompt } from "./systemPrompt";
import { RelayWebsocket } from "./ws";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;
  // const client = new Anthropic();
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const project = await prismaClient.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const promptDb = await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const { diff } = await RelayWebsocket.getInstance().sendAndAwaitResponse(
    {
      event: "admin",
      data: {
        type: "prompt-start",
      },
    },
    promptDb.id
  );

  console.log("after diff");

  if (diff) {
    await prismaClient.prompt.create({
      data: {
        content: `<bolt-user-diff>${diff}</bolt-user-diff>\n\n$`,
        projectId,
        type: "USER",
      },
    });
  }

  const allPrompts = await prismaClient.prompt.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let artifactProcessor = new ArtifactProcessor(
    "",
    (filePath, fileContent) =>
      onFileUpdate(filePath, fileContent, projectId, promptDb.id, project.type),
    (shellCommand) => onShellCommand(shellCommand, projectId, promptDb.id)
  );
  let artifact = "";

  console.log("before geminin call");

  // let response = client.messages
  //   .stream({
  //     messages: allPrompts.map((p: any) => ({
  //       role: p.type === "USER" ? "user" : "assistant",
  //       content: p.content,
  //     })),
  //     system: systemPrompt(project.type),
  //     model: "claude-3-7-sonnet-20250219",
  //     max_tokens: 8000,
  //   })
  //   .on("text", (text) => {
  //     artifactProcessor.append(text);
  //     artifactProcessor.parse();
  //     artifact += text;
  //   })
  //   .on("finalMessage", async (message) => {
  //     console.log("done!");
  //     await prismaClient.prompt.create({
  //       data: {
  //         content: artifact,
  //         projectId,
  //         type: "SYSTEM",
  //       },
  //     });

  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash-001",
    contents: allPrompts.map((p: any) => ({
      role: p.type === "USER" ? "user" : "model", // Gemini uses "user" and "model"
      parts: [{ text: p.content }],
    })),
    config: {
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt(project.type) }],
      },
      maxOutputTokens: 8000,
    },
  });

  for await (const chunk of response) {
    // console.log(chunk.text);
    const text = chunk.text!;
    artifactProcessor.append(text);
    artifactProcessor.parse();
    artifact += text;
  }

  console.log("after gemini call");

  await prismaClient.prompt.create({
    data: {
      content: artifact,
      projectId,
      type: "SYSTEM",
    },
  });

  await prismaClient.action.create({
    data: {
      content: "Done!",
      projectId,
      promptId: promptDb.id,
    },
  });
  onPromptEnd(promptDb.id);

  res.json({ response });
});

app.listen(9091, () => {
  console.log("Server is running on port 9091");
});
