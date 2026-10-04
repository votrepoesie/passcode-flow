import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// The Figma file sets every label and digit in Inter Medium.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Passcode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans font-medium">{children}</body>
    </html>
  );
}
