import { authMiddleware } from "common/middleware";
import cors from "cors";
import { prismaClient } from "db/client";
import express from "express";
const app = express();

app.use(express.json());
app.use(cors());

app.post("/project", authMiddleware, async (req, res) => {
  const { prompt, type } = req.body;
  const userId = req.userId!;
  //TODO: add logic to get a useful name for the project from the prompt
  const description = prompt.split("\n")[0];
  const project = await prismaClient.project.create({
    data: { description, userId, type },
  });
  res.json({ projectId: project.id });
});

app.get("/projects", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const projects = await prismaClient.project.findMany({
    where: { userId },
  });
  res.json({ projects });
});

app.get("/prompts/:projectId", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const projectId = req.params.projectId;

  const prompts = await prismaClient.prompt.findMany({
    where: { projectId },
    include: {
      actions: true,
    },
  });
  res.json({ prompts });
});

app.listen(9090, () => {
  console.log("Server is running on port 9090");
});
