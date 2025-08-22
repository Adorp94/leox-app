import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "LEOX",
  description: "Sistema integral para el control de contratos y cobranza de proyectos inmobiliarios en preventa",
  keywords: ["inmobiliaria", "contratos", "cobranza", "proyectos", "residential"],
  icons: {
    icon: "/leox.ico",
    shortcut: "/leox.ico",
    apple: "/leox.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/leox.ico" sizes="any" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
