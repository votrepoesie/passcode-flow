import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// The Figma file sets every label and digit in Inter Medium. Figma renders
// Inter 3.x; Google Fonts serves Inter 4, whose glyphs are ~2px wider at
// 24px, so the 3.19 release is self-hosted (OFL, see fonts/LICENSE-Inter.txt).
const inter = localFont({
  src: "./fonts/Inter-Medium-3.19.woff2",
  variable: "--font-inter",
  weight: "500",
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
