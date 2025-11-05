import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "./themeProviders";


export const metadata: Metadata = {
  title: "Pegasus",
  description: "College Examination System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProviders>
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}
