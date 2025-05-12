import { Appbar } from "@/components/appbar";
import { Hero } from "@/components/hero";
import { Prompt } from "@/components/prompt";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset className="bg-gradient-to-b from-white to-teal-50/50 dark:from-zinc-950 dark:to-zinc-900 min-h-screen">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-4xl mx-auto">
        <div className="space-y-4 px-4" >
          <div className="space-y-4">
            <Appbar />

            <div className="max-w-2xl mx-auto pt-24 sm:pt-32">
              <Hero />

              <div className="pt-8 sm:pt-12">
                <Prompt />
              </div>
            </div>
          </div>
        </div >
      </div >

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-300/10 dark:bg-teal-400/5 rounded-full blur-[100px] opacity-70" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-300/10 dark:bg-teal-400/5 rounded-full blur-[100px] opacity-70" />
      </div>
    </SidebarInset >
  );
}