import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { Metadata } from "next"
import { Figtree } from "next/font/google"

import "./globals.css"

import { ClerkProvider } from "@clerk/nextjs"

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: "300",
});

export const metadata: Metadata = {
  title: "NAME_OF_APP",
  description: "An App that allows you to create solana smart contract using natural language and deploy them"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(`font-sans selection:bg-teal-400/70 selection:text-white dark:selection:bg-teal-200/20 dark:selection:text-teal-200 antialiased`,
            figtree.variable
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

            <SidebarProvider defaultOpen={false} className="relative">
              <AppSidebar />
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}