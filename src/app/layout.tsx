import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VazCRM - Sistema de Control de Contratos Inmobiliarios",
  description: "Sistema integral para el control de contratos y cobranza de proyectos inmobiliarios en preventa",
  keywords: ["inmobiliaria", "contratos", "cobranza", "proyectos", "residential"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
