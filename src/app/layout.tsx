import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abyssal Academy - Online Academy Management",
  description: "Manage your academy groups, teachers, students, and payments all in one place. Abyssal Academy - Professional yet playful.",
  keywords: ["Abyssal Academy", "academy management", "education", "online learning"],
  authors: [{ name: "Abyssal Academy" }],
  icons: {
    icon: "/brandmark.png",
  },
  openGraph: {
    title: "Abyssal Academy",
    description: "Online Academy Management Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
            },
          }}
        />
      </body>
    </html>
  );
}
