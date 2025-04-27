import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: "lumivita.co",
  description: "Bringing light into your life",
  icons: {
    icon: "/lumivitaDesigns/Lumi.png",

  },
};

// ROOT LAYOUT. Do not touch this file
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${poppins.className}`}>
      <body
        className={`${poppins.variable}  antialiased bg-background`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
