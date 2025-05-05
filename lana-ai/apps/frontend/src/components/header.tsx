import { Button } from '@/components/ui/button'
import { itemVariants } from '@/lib/animation-variants'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Image from 'next/image'
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
            <Link href="/">
                <img src="/logo.svg" alt="Lana Ai" width={40} height={40} />
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