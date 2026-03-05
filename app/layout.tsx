import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import AppwritePing from "@/components/system/AppwritePing";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InCloud — Private Cloud Storage",
  description:
    "Your private cloud, your rules. Secure personal file storage with zero third-party access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${dmSans.variable} antialiased`}>
        <AppwritePing />
        {children}
      </body>
    </html>
  );
}
