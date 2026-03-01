import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
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
  title: "eMEI — Portal do Microempreendedor Individual",
  description:
    "Guia interativo para abrir e gerenciar seu MEI. Passo a passo completo, tabela de CNAEs, gerador de notas/orçamentos, área de clientes, gestão financeira, currículos e ferramentas exclusivas com IA.",
  keywords: [
    "MEI",
    "Microempreendedor Individual",
    "abrir MEI",
    "CNPJ MEI",
    "DAS",
    "CNAE",
    "Simples Nacional",
    "Gestão Financeira MEI",
    "Orçamento MEI"
  ],
  openGraph: {
    title: "eMEI — O Portal Definitivo do Microempreendedor", // ~50 chars
    description: "Abra seu MEI, controle finanças, crie orçamentos, veja CNAEs e tenha um CRM gratuito focado no pequeno empreendedor brasileiro.", // ~130 chars
    url: "https://emei-portal.com",
    siteName: "eMEI Portal",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "eMEI - Portal do Microempreendedor Individual",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "eMEI — O Portal Definitivo do Microempreendedor",
    description: "Abra seu MEI, controle finanças, crie orçamentos, veja CNAEs e tenha um CRM gratuito focado no pequeno empreendedor brasileiro.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
