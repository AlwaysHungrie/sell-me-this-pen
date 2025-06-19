import type { Metadata } from "next";
import { Open_Sans, Geist_Mono, Rock_Salt } from "next/font/google";
import "./globals.css";

const geistSans = Open_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sedgwickAve = Rock_Salt({
  variable: "--font-sedgwick-ave",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sell Me This Pen",
  description: "Sell Me This Pen",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sedgwickAve.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
