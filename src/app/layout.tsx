import type { Metadata, Viewport } from "next";
import { Quicksand, Nunito_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Senda Chat - Portal de Voluntarios",
  description: "Plataforma de recursos para voluntarios de Senda Chat",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon-orange.png",
    shortcut: "/favicon-orange.png",
    apple: "/favicon-orange.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Senda Chat",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#9ab5af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${quicksand.variable} ${nunitoSans.variable} antialiased`}
        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
