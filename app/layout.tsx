import type { Metadata } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/dm-sans";
import AppwritePing from "@/components/system/AppwritePing";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

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
      <body className="antialiased">
        <AuthProvider>
          <AppwritePing />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
