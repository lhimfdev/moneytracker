import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Lhimf",
  description: "Digital savings compilation system",
  icons: {
    icon: "/lhimflogo.png",
    shortcut: "/lhimflogo.png",
    apple: "/lhimflogo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lhimf",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

