import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import CustomCursor from "@/components/custom-cursor";
import { AuthProvider } from "@/lib/auth-context";
import { ReactionsProvider } from "@/lib/reactions-context";

export const metadata: Metadata = {
  title: "Meowtimap - Your Journey Through Asian Culture",
  description: "Collect cultures. Earn stamps. Fall in love with Asia.",
  keywords: ["Asia", "culture", "travel", "education", "stamps", "passport", "Japan", "Korea", "China", "Thailand", "Vietnam", "Indonesia", "Malaysia", "Philippines", "Singapore", "India"],
  authors: [{ name: "Meowtimap" }],
  creator: "Meowtimap",
  publisher: "Meowtimap",
  metadataBase: new URL('https://meowtimap.smoltako.space'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Meowtimap - Your Journey Through Asian Culture",
    description: "Collect cultures. Earn stamps. Fall in love with Asia.",
    url: 'https://meowtimap.smoltako.space',
    siteName: 'Meowtimap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meowtimap - Explore Asian Culture',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Meowtimap - Your Journey Through Asian Culture",
    description: "Collect cultures. Earn stamps. Fall in love with Asia.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ReactionsProvider>
            <CustomCursor />
            <Navbar />
            <main className="pt-16 md:pt-16 pb-24 md:pb-0">
              {children}
            </main>
          </ReactionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
