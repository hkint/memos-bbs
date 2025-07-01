import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { BackToTopButton } from "@/components/shared/BackToTopButton";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Placeholder for i18n function - not typically used in layout metadata directly
// const i18n = (key: string) => key;

export const metadata: Metadata = {
  title: "MemoBBS Next", // Consider making this dynamic or more generic if i18n is set up later
  description: "A modern MemoBBS client built with Next.js",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" }, // Tailwind's default bg-background for light
    { media: "(prefers-color-scheme: dark)", color: "hsl(240 10% 3.9%)" }, // Tailwind's default bg-background for dark
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main> {/* Added common page padding here */}
            {/* Add a Footer component here if needed */}
            <BackToTopButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
