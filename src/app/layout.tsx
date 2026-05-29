import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "ArtMorph AI — Creative Transformation Platform",
    template: "%s | ArtMorph AI",
  },
  description:
    "Transform sketches, wireframes, and visual concepts into professional-quality creative assets with AI.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ArtMorph AI",
    title: "ArtMorph AI",
    description:
      "Multimodal AI-powered creative transformation for designers and teams.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
