'use client'

import { containerVariants, itemVariants } from '@/lib/animation-variants'
import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

export const Hero = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className='relative'>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-teal-400/20 dark:bg-teal-400/10 blur-[80px] rounded-full opacity-70 -z-10" />
                <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl drop-shadow-sm bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-teal-200/80 bg-clip-text text-transparent">
                    Bring your imagination to life
                </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-teal-300/30 dark:border-teal-200/10 bg-gradient-to-r from-teal-100/80 to-teal-50/50 dark:from-teal-900/20 dark:to-teal-800/5 shadow-sm">
                    <Sparkles className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                    <p className="font-medium text-teal-700 dark:text-teal-300/90">
                        Prompt, click generate and watch your app come to life
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}