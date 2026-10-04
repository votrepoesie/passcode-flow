import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brand } from "@/lib/brand";
import "./globals.css";

// Code face (design-system/docs/DESIGN-SYSTEM.md).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// UI face for headings, body, and labels. Variable font.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${brand.name} Design System`,
  description: brand.description,
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
