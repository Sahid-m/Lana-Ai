import { Button } from '@/components/ui/button'
import { itemVariants } from '@/lib/animation-variants'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { SidebarTrigger } from './ui/sidebar'

export const Header = ({ children, className, onClick }: {
    children?: React.ReactNode,
    className?: string,
    onClick?: () => void
}) => {
    return (
        <motion.header variants={itemVariants} className="flex items-center gap-2 bg-zinc-100 border dark:border-zinc-800 dark:hover:bg-zinc-600/10 dark:bg-zinc-900 px-4 py-2 rounded-3xl">
            <SidebarTrigger
                variant="link"
                className="[&_svg:not([class*='size-'])]:size-5 cursor-pointer"
            />
            <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center size-8 rounded-full bg-teal-500/10 group-hover:bg-teal-500/20 transition-all duration-200">
                    <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="font-semibold text-lg bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-teal-200 bg-clip-text text-transparent">
                    Lana AI
                </span>
            </Link>
            {children && <Button
                variant="link"
                data-sidebar="trigger"
                data-slot="sidebar-trigger"
                size="icon"
                className={cn("h-7 w-7 [&_svg:not([class*='size-'])]:size-5 cursor-pointer", className)}
                onClick={onClick}
            >
                {children}
            </Button>}
        </motion.header>
    )
}