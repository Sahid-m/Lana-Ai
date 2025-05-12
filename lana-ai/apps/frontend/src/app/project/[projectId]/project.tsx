"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { usePrompts } from "@/hooks/usePrompts";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { Code2, MoveUpRight, Play, SplitSquareVertical, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// session url -> Docker container url 
export const Project: React.FC<{ projectId: string, sessionUrl: string, previewUrl?: string, workerUrl: string }> = ({ projectId, sessionUrl, workerUrl }) => {
    const router = useRouter()
    const { prompts } = usePrompts(projectId);
    const [prompt, setPrompt] = useState("");
    const { getToken } = useAuth();
    const { user } = useUser();
    const [tab, setTab] = useState("code");
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);


    // TODO MAKE IT LIKE A REQUEST AND RESPONSE
    // Show overlay for 50s on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsOverlayVisible(false);
        }, 10000); // 50,000ms = 50s

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!isOverlayVisible) return;

        const latestPrompt = [...prompts]
            .filter((p) => p.type === "USER")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (latestPrompt?.actions.some((a) => a.content.trim().toLowerCase() === "done")) {
            setIsOverlayVisible(false);
        }
    }, [prompts, isOverlayVisible]);




    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsOverlayVisible(true);

        const token = await getToken();
        axios.post(
            `${workerUrl}/prompt`,
            {
                projectId: projectId,
                prompt: prompt,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        setPrompt("");

        setTimeout(() => {
            setIsOverlayVisible(false);
        }, 10000);
    }, [projectId, workerUrl, getToken, prompt]);

    return (
        <SidebarInset className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="grid h-screen max-h-screen w-full grid-cols-1 md:grid-cols-[minmax(350px,auto)_1fr]">
                {/* Left Panel - Chat & Prompts */}
                <div className="flex flex-col h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <Header onClick={() => router.push("/")} className="hover:opacity-80 transition-opacity">
                            <SquarePen className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                        </Header>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Project Workspace</div>
                    </div>

                    {/* Conversation Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">

                        {prompts
                            .filter((prompt) => prompt.type === "USER" && prompt.actions.length > 0)
                            .map((prompt) => (
                                <div key={prompt.id} className="space-y-4">
                                    {/* User Message */}
                                    <div className="flex items-start max-w-sm gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <img
                                                src={user?.imageUrl || ""}
                                                width={32}
                                                height={32}
                                                alt="Profile"
                                                className="rounded-full w-8 h-8 border border-zinc-200 dark:border-zinc-700"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed">
                                                {prompt.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Responses */}
                                    {prompt.actions.map((action) => (
                                        <div
                                            key={action.id}
                                            className="ml-11 pl-3 border-l-2 border-teal-200 dark:border-teal-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30">
                                                    <div className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                                                        {action.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                    </div>

                    {/* Prompt Input */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <form onSubmit={(e) => onSubmit(e)} className="relative">
                            <div className="overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-teal-500/30 dark:focus-within:ring-teal-400/20 bg-white dark:bg-zinc-800 transition-all duration-200">
                                <Textarea
                                    value={prompt}
                                    placeholder="Write a prompt..."
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[100px] max-h-[200px] w-full resize-none border-0 bg-transparent p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-0"
                                />
                                <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 pl-2">
                                        {prompt ? `${prompt.length} characters` : "Type your instructions..."}
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={!prompt}
                                        className="rounded-full bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700 transition-colors"
                                    >
                                        <MoveUpRight className="h-4 w-4" />
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Panel - Code & Preview */}
                <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">

                    {/* Tabs */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {tab === "code" ? "Code Editor" : tab === "preview" ? "Preview" : "Split View"}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={tab === "code" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTab("code")}
                                className={tab === "code" ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}
                            >
                                <Code2 className="h-4 w-4 mr-1" />
                                Code
                            </Button>
                            <Button
                                variant={tab === "preview" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTab("preview")}
                                className={tab === "preview" ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}
                            >
                                <Play className="h-4 w-4 mr-1" />
                                Preview
                            </Button>
                            <Button
                                variant={tab === "split" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTab("split")}
                                className={tab === "split" ? "bg-teal-500 hover:bg-teal-600 text-white" : ""}
                            >
                                <SplitSquareVertical className="h-4 w-4 mr-1" />
                                Split
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden">
                        <div
                            className={`absolute inset-0 transition-all duration-300 ${tab === "code"
                                ? "left-0 w-full"
                                : tab === "split"
                                    ? "left-0 w-1/2 border-r border-zinc-200 dark:border-zinc-800"
                                    : "left-[-100%] w-full"
                                }`}
                        >
                            <iframe src={`${sessionUrl}/`} className="w-full h-full" title="Code Editor" />
                        </div>
                        <div
                            className={`absolute inset-0 transition-all duration-300 ${tab === "preview" ? "left-0 w-full" : tab === "split" ? "left-1/2 w-1/2" : "left-[100%] w-full"
                                }`}
                        >
                            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                <div className="text-center">
                                    <p className="text-lg font-medium">Preview Unavailable</p>
                                    <p className="text-sm mt-2">Preview functionality is currently in development</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            {isOverlayVisible && (
                <div className="fixed inset-0 bg-black/25  backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 space-y-6 text-white pointer-events-auto">
                    <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full" />
                    <div className="text-center space-y-2 max-w-lg">
                        <p className="text-lg font-semibold">Processing your prompt...</p>
                        <p className="text-sm opacity-80">Please wait while we process your request.</p>
                    </div>
                </div>
            )}


        </SidebarInset >
    )
}