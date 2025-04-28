import ProjectWithInitRequest from "@/components/project-with-init-req";
import { DOCKER_URL, WORKER_URL } from "@/config";
import axios from "axios";

interface Params {
    params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: Params) {
    const projectId = (await params).projectId
    // const response = await axios.get(`${K8S_ORCHESTRATOR_URL}/worker/${projectId}`);
    // const { sessionUrl, previewUrl, workerUrl } = response.data;

    const sessionUrl = DOCKER_URL;

    const workerUrl = WORKER_URL;

    return <ProjectWithInitRequest
        projectId={projectId}
        sessionUrl={sessionUrl}
        workerUrl={workerUrl}
    />
}