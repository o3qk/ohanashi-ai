import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "お話AI",
  description: "5歳の孫「はなちゃん」とおしゃべりできるWebアプリ"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // 画面全体のレイアウトを定義するコンポーネントです。
  // ここで日本語向けの lang 設定や、中央寄せレイアウトを行います。
  return (
    <html lang="ja">
      <body className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </body>
    </html>
  );
}

