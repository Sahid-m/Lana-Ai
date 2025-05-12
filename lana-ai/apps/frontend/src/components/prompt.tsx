"use client";

import { BACKEND_URL } from "@/config";
import { containerVariants, itemVariants } from "@/lib/animation-variants";
import { prompts } from "@/lib/constants";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { ArrowRight, ChevronRight, Coins, Lock, MessageSquare, MoveUpRight, Sparkles, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Prompt() {
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    const promptRef = useRef<HTMLTextAreaElement>(null);
    const [prompt, setPrompt] = useState("");
    const [type, setType] = useState<"SMART_CONTRACT" | "DAPP">("SMART_CONTRACT");

    const { getToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (promptRef.current) {
            promptRef.current.focus();
        }
    }, [])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await getToken();
        if (!token) {
            setIsSignedIn(true);
            return
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/project`, {
                prompt: prompt,
                type: type,
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            router.push(`/project/${response.data.projectId}?initPrompt=${prompt}`);
        } catch (e) {
            alert("Backend Seemed to be down!");
        }

    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <div className="px-4 py-2 sm:static sm:w-auto fixed bottom-0 left-0 w-full">
                <div className="flex flex-row gap-2 mb-4 justify-center">
                    <Button
                        variant={type === "SMART_CONTRACT" ? "default" : "outline"}
                        onClick={() => setType("SMART_CONTRACT")}
                        className={`rounded-full px-5 ${type === "SMART_CONTRACT" ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 hover:bg-teal-500/20 dark:hover:bg-teal-400/20 border-teal-500/20 dark:border-teal-400/20" : "hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-500/5 dark:hover:bg-teal-400/5"}`}
                    >
                        Smart Contract ( Anchor )
                    </Button>
                    <Button
                        variant={type === "DAPP" ? "default" : "outline"}
                        onClick={() => setType("DAPP")}
                        className={`rounded-full px-5 ${type === "DAPP" ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 hover:bg-teal-500/20 dark:hover:bg-teal-400/20 border-teal-500/20 dark:border-teal-400/20" : "hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-500/5 dark:hover:bg-teal-400/5"}`}
                    >
                        Decentralised App
                    </Button>
                </div>
                <motion.form variants={itemVariants} onSubmit={(e) => onSubmit(e)} className="relative w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-zinc-900/30 backdrop-blur-sm focus-within:border-teal-300/50 dark:focus-within:border-teal-400/30 rounded-2xl transition-all duration-200 shadow-sm">
                    <div className="p-3">
                        <Textarea
                            ref={promptRef}
                            value={prompt}
                            placeholder="Write your prompt here..."
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full placeholder:text-zinc-400/60 bg-transparent border-none shadow-none text-md rounded-none focus-visible:ring-0 min-h-16 max-h-80 resize-none outline-none"
                        />
                    </div>

                    <div className="p-2 flex items-center justify-between">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 pl-2 italic">
                            {prompt.length > 0 ? `${prompt.length} characters` : "Start typing..."}
                        </div>
                        <Button
                            type="submit"
                            className="h-10 w-10 cursor-pointer rounded-full bg-gradient-to-br from-teal-400 to-teal-500 dark:from-teal-500 dark:to-teal-600 hover:opacity-90 flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            disabled={!prompt}
                        >
                            <MoveUpRight className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                </motion.form>
            </div>

            <motion.div variants={itemVariants} className="w-full mt-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 max-w-[100px]"></div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                        Suggested Prompts
                    </h3>
                    <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 max-w-[100px]"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-2">
                    {prompts.map((prompt) => (
                        <button
                            onClick={() => setPrompt(prompt.title)}
                            key={prompt.id}
                            className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:border-teal-300/50 dark:hover:border-teal-400/30 hover:shadow-md transition-all duration-200"
                        >
                            {/* Gradient background effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent dark:from-teal-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative p-4 flex flex-col h-full">
                                <div className="flex items-start gap-3 mb-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shrink-0">
                                        {prompt.id === 1 && <MessageSquare className="h-4 w-4" />}
                                        {prompt.id === 2 && <Lock className="h-4 w-4" />}
                                        {prompt.id === 3 && <Coins className="h-4 w-4" />}
                                        {prompt.id === 4 && <Wallet className="h-4 w-4" />}
                                    </div>
                                    <p className="font-medium text-zinc-800 dark:text-zinc-200 text-sm text-left">{prompt.title}</p>
                                </div>

                                <div className="mt-auto pt-2 flex justify-end">
                                    <div className="text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
                                        Use prompt <ArrowRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}

                </div>
            </motion.div>

            <AlertDialog open={isSignedIn} onOpenChange={setIsSignedIn}>
                <AlertDialogContent className="border-2 border-teal-400/20 bg-white dark:bg-zinc-900 backdrop-blur-lg rounded-xl shadow-xl">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/50">
                                <ChevronRight className="text-teal-600 dark:text-teal-400 h-5 w-5" />
                            </div>
                            <AlertDialogTitle className="text-zinc-900 dark:text-white">You are not signed in</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-zinc-600 dark:text-zinc-300">
                            Please sign in to access this feature. Your data is safe and will not be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="rounded-full bg-teal-500 hover:bg-teal-600 text-white">
                            Sign in
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
