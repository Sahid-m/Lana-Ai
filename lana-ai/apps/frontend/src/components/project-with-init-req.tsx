"use client"
import { Project } from "@/app/project/[projectId]/project";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ProjectWithInitRequest({
    projectId,
    sessionUrl,
    workerUrl
}: {
    projectId: string,
    sessionUrl: string,
    previewUrl?: string,
    workerUrl: string
}) {
    const searchParams = useSearchParams()
    const initPrompt = searchParams.get('initPrompt');
    const { getToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (initPrompt) {
                const token = await getToken();
                axios.post(
                    `${workerUrl}/prompt`,
                    {
                        projectId: projectId,
                        prompt: initPrompt,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
            }

            // window.location.href = `/project/${projectId}`;
        })()
    }, [projectId, initPrompt, workerUrl, getToken, router]);

    return <Project
        projectId={projectId}
        sessionUrl={sessionUrl}
        workerUrl={workerUrl}
    />
}