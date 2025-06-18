import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Engage Coach",
  description: "Instructors helping instructors succeed"
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <nav className="w-full border-b border-b-foreground/10 h-16 px-5">
              <div className="max-w-7xl w-full mx-auto flex items-center h-full">
                {/* This div reserves the left space to align with the sidebar */}
                <div className="w-64">
                  <Link href="/" className="text-lg font-bold">
                    Engage Coach
                  </Link>
                </div>
                <div className="flex space-x-4">
                  <Link href="/about" className="text-gray-500 hover:text-blue-600">
                    About
                  </Link>
                </div>
                
                <div className="flex-1 flex justify-end">
                  <HeaderAuth />
                </div>
              </div>
            </nav>
            {children}
            {/* <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Created by{" "}
                <a
                  href=""
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  QuerySmith
                </a>
              </p>
              <ThemeSwitcher />
            </footer> */}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
