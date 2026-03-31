import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "HealthAI | Premium Diagnostics",
  description: "Advanced AI-powered healthcare diagnosis platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-white bg-[#0a0a0f] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
