import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annotation Activity Console",
  description: "Task activity console assessment"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
