import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { WorkspaceProvider } from "@/components/workspace-provider";
import "./globals.css";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const metadata: Metadata = { title: "Polar Publish · Your words, everywhere", description: "A thoughtful workspace for writing, adapting, and distributing your ideas." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 const content = <WorkspaceProvider>{children}<Toaster theme="dark" richColors closeButton position="bottom-right" /></WorkspaceProvider>;
 return <html lang="en" data-mode="dark" className={`dark ${geist.variable}`}><body>{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkProvider>{content}</ClerkProvider> : content}</body></html>;
}
