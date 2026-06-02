import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ['300', '400', '600', '800'] });

export const metadata: Metadata = {
  title: "Pure Wild Honey | Premium 3D Experience",
  description: "A cinematic 3D scrollytelling experience for premium wild honey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
