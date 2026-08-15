import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { Outfit } from "next/font/google";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { auth } from "@acme/auth";

import CreateActivity from "~/components/layout/create-activity";
import CreateFolderDialog from "~/components/layout/create-folder-dialog";
import CreateClassDialog from "~/components/layout/create-class-dialog";
import Navbar from "~/components/layout/navbar";
import MainLayout from "~/components/layout/main-layout";
import Footer from "~/components/layout/footer";
import SignInDialog from "~/components/layout/sign-in-dialog";

import FolderDialogProvider from "~/contexts/folder-dialog-context";
import ClassDialogProvider from "~/contexts/class-dialog-context";
import SignInDialogProvider from "~/contexts/sign-in-dialog-context";
import { LanguageProvider } from "~/contexts/i18n-context";
import { env } from "~/env";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "Quizlet Clone",
  description: "Ứng dụng học tập Quizlet Clone",
  openGraph: {
    title: "Quizlet Clone",
    description: "Ứng dụng học tập Quizlet Clone",
    siteName: "Quizlet Clone",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          outfit.variable,
          GeistMono.variable,
        )}
      >
        <LanguageProvider>
          <SignInDialogProvider>
            <FolderDialogProvider>
              <ClassDialogProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "dracula"]}>
                  <TRPCReactProvider>
                    <MainLayout session={session}>
                      <Navbar session={session} />
                      <main className="flex-1 w-full min-h-[calc(100vh-65px)] py-6 px-4 md:px-8">
                        {props.children}
                      </main>
                      <Footer />
                    </MainLayout>
                    <Toaster richColors />
                    {session ? (
                      <>
                        <CreateActivity />
                        <CreateFolderDialog />
                        <CreateClassDialog />
                      </>
                    ) : (
                      <SignInDialog />
                    )}
                  </TRPCReactProvider>
                </ThemeProvider>
              </ClassDialogProvider>
            </FolderDialogProvider>
          </SignInDialogProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
