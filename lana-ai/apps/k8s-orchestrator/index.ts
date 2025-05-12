process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import * as k8s from "@kubernetes/client-node";
import { CoreV1Api, KubeConfig } from "@kubernetes/client-node";
import cors from "cors";
import { prismaClient } from "db/client";
import express from "express";
import promClient from "prom-client";
import { Writable } from "stream";
import { DOMAIN } from "./config";

const containerCreateBucket = new promClient.Histogram({
  name: "container_create_bucket",
  help: "Number of times a container was created",
  labelNames: ["type"],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000],
});

const kc = new KubeConfig();
const app = express();

kc.loadFromDefault();

app.use(cors());

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const currentContext = kc.getCurrentContext();
const cluster = kc.getCluster(currentContext);

async function listPods(): Promise<string[]> {
  const res = await k8sApi.listNamespacedPod({ namespace: "user-apps" });
  console.log(res.items.map((pod) => pod.status?.phase));
  return res.items
    .filter(
      (pod) =>
        pod.status?.phase === "Running" || pod.status?.phase === "Pending"
    )
    .filter((pod) => pod.metadata?.name)
    .map((pod) => pod.metadata?.name as string);
}

async function createPod(name: string) {
  await k8sApi.createNamespacedPod({
    namespace: "user-apps",
    body: {
      metadata: {
        name: name,
        labels: {
          app: name,
        },
      },
      spec: {
        containers: [
          {
            name: "code-server",
            image: "sahidm/lana-ai-coder-server:2",
            ports: [{ containerPort: 8080 }],
          },
          {
            name: "ws-relayer",
            image: "sahidm/lana-ai-ws-relayer:2",
            ports: [{ containerPort: 9093 }],
          },
          {
            name: "worker",
            image: "sahidm/lana-ai-worker:2",
            ports: [{ containerPort: 9091 }],
            env: [
              {
                name: "WS_RELAYER_URL",
                value: `ws://localhost:9091`,
              },
              {
                name: "ANTHROPIC_API_KEY",
                valueFrom: {
                  secretKeyRef: {
                    name: "worker-secret",
                    key: "ANTHROPIC_API_KEY",
                  },
                },
              },
              {
                name: "DATABASE_URL",
                valueFrom: {
                  secretKeyRef: {
                    name: "worker-secret",
                    key: "DATABASE_URL",
                  },
                },
              },
            ],
          },
        ],
      },
    },
  });

  await k8sApi.createNamespacedService({
    namespace: "user-apps",
    body: {
      metadata: {
        name: `session-${name}`,
      },
      spec: {
        selector: {
          app: name,
        },
        ports: [
          { port: 8080, targetPort: 8080, protocol: "TCP", name: "session" },
        ],
      },
    },
  });

  await k8sApi.createNamespacedService({
    namespace: "user-apps",
    body: {
      metadata: {
        name: `preview-${name}`,
      },
      spec: {
        selector: {
          app: name,
        },
        ports: [
          { port: 8080, targetPort: 8081, protocol: "TCP", name: "preview" },
        ],
      },
    },
  });

  await k8sApi.createNamespacedService({
    namespace: "user-apps",
    body: {
      metadata: {
        name: `worker-${name}`,
      },
      spec: {
        selector: {
          app: name,
        },
        ports: [
          { port: 8080, targetPort: 9091, protocol: "TCP", name: "preview" },
        ],
      },
    },
  });
}

async function checkPodIsReady(name: string) {
  let attempts = 0;
  while (true) {
    const pod = await k8sApi.readNamespacedPod({
      namespace: "user-apps",
      name,
    });
    if (pod.status?.phase === "Running") {
      return;
    }
    if (attempts > 10) {
      throw new Error("Pod is not ready");
    }
    //TODO: Exponential backoff
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
}

async function assignPodToProject(
  projectId: string,
  projectType: "SMART_CONTRACT" | "DAPP"
) {
  const pods = await listPods();
  const podExists = pods.find((pod) => pod === projectId);
  if (!podExists) {
    console.log("Pod does not exist, creating pod");
    await createPod(projectId);
  }

  console.log("Pod exists, checking if it is ready");
  await checkPodIsReady(projectId);
  console.log("Pod is ready, moving project to pod");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`Assigned project ${projectId} to pod ${projectId}`);
}

app.get("/worker/:projectId", async (req, res) => {
  console.log(
    "Received request to assign project to pod for project",
    req.params.projectId
  );
  const { projectId } = req.params;
  const project = await prismaClient.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  console.log("Project found, assigning to pod");
  const startTime = Date.now();
  await assignPodToProject(projectId, "SMART_CONTRACT");
  console.log("Pod assigned, sending response");
  containerCreateBucket.observe({ type: project.type }, Date.now() - startTime);

  res.json({
    sessionUrl: `https://session-${projectId}.${DOMAIN}`,
    previewUrl: `https://preview-${projectId}.${DOMAIN}`,
    workerUrl: `https://worker-${projectId}.${DOMAIN}`,
  });
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(7001, () => {
  console.log("Server is running on port 7001");
});
