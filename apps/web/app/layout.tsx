import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Coloring Book Generator",
  description: "Создавайте раскраски из фотографий за 5-15 секунд",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
