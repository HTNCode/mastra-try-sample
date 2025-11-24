import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Mastra Try Sample",
  description: "A sample project using Mastra AI agent framework with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased p-4`}>{children}</body>
    </html>
  );
}
