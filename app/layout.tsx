import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Meowtimap - Your Journey Through Asian Culture",
  description: "Collect cultures. Earn stamps. Fall in love with Asia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Navbar />
        <main className="pt-16 md:pt-16 pb-24 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
