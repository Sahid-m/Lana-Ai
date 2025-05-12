'use client';

import { Header } from '@/components/header';
import { ThemeButton } from '@/components/theme-button';
import { containerVariants, itemVariants } from '@/lib/animation-variants';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';
import { motion } from 'motion/react';

export function Appbar() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center mt-6 justify-between px-2"
        >
            <Header />

            <motion.div variants={itemVariants} className="flex gap-3 items-center justify-center">
                <ThemeButton />

                <SignedOut>
                    <SignInButton>
                        <button
                            className="border border-zinc-800 hover:bg-teal-500/5 dark:hover:bg-teal-400/10 bg-zinc-100/5 dark:bg-zinc-900/80 transition-all duration-200 cursor-pointer px-4 py-2 rounded-full text-sm font-medium"
                        >
                            Sign In
                        </button>
                    </SignInButton>

                    <SignUpButton>
                        <button
                            className="border border-teal-500/20 dark:border-teal-400/20 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 bg-teal-500/5 dark:bg-teal-400/5 transition-all duration-200 cursor-pointer px-4 py-2 rounded-full text-sm font-medium text-teal-700 dark:text-teal-300"
                        >
                            Sign Up
                        </button>
                    </SignUpButton>
                </SignedOut>

                <SignedIn>
                    <UserButton />
                </SignedIn>
            </motion.div>
        </motion.div>
    );
}
