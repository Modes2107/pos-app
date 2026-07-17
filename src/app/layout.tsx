import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/session";
import Nav from "@/components/Nav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin", "latin-ext"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "КасаPOS — облік продажів",
  description: "Облік продажів, складу та статистики для магазину",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="uk">
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        {session ? (
          <div className="flex min-h-screen flex-col md:flex-row">
            <Nav username={session.username} />
            <main className="flex-1 md:pl-60 pb-20 md:pb-0">{children}</main>
          </div>
        ) : (
          <main className="min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}
