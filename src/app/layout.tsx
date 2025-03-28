import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "햇반 타임밥슐",
  description: "지금 이 밥 한 끼의 기억, 미래의 나에게 전해줄래요?",
  icons: {
    icon: [
      { url: "/images/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/images/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100">
          {children}
        </main>
      </body>
    </html>
  );
}
