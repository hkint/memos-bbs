import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider"; // Assuming a local ThemeProvider component will be created or next-themes is used directly
import { Header } from "@/components/layout/Header";
// import { useInitializeTheme } from "@/stores/settings"; // Using next-themes ThemeProvider instead

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Placeholder for i18n function
const i18n = (key: string) => key;

export const metadata: Metadata = {
  title: "MemoBBS Next",
  description: "A modern MemoBBS client built with Next.js",
  manifest: "/manifest.json", // Link to the manifest file in /public
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const InitializeTheme = () => { // This was for Zustand theme, replaced by ThemeProvider
  //   useInitializeTheme();
  //   return null;
  // };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* manifest.json is now in metadata, but can also be linked directly if preferred: */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </head>
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
          {/* <InitializeTheme /> */}
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            {/* Add a Footer component here if needed */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
