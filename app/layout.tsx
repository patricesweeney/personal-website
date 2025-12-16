import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Patrick Sweeney",
  description: "Personal website of Patrick Sweeney",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand">Patrick Sweeney</div>
            <nav className="nav">
              <Link href="/">About</Link>
              <Link href="/projects">Projects</Link>
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>

        <footer>
          <div className="container muted">© {year} Patrick Sweeney</div>
        </footer>
      </body>
    </html>
  );
}

