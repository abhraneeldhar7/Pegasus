import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "./themeProviders";
import FooterPage from "@/components/ui/footer";
import { UserProvider } from "@/context/userProvider";
import { Toaster } from "@/components/ui/sonner";


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
          <UserProvider>
            <Toaster richColors position="top-center" />
            {children}
            <FooterPage />
          </UserProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
