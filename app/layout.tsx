import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLOC — Ultra Baggy. Vertical City.",
  description:
    "BLOC : un pantalon bleu profond, ultra baggy, ultra lourd, serrable aux chevilles. Conçu pour le bitume et la falaise.",
  keywords: [
    "BLOC",
    "pantalon baggy",
    "escalade",
    "streetwear",
    "vertical city",
  ],
  authors: [{ name: "BLOC" }],
  openGraph: {
    title: "BLOC — Ultra Baggy. Vertical City.",
    description:
      "Un pantalon bleu profond, ultra baggy, conçu pour le bitume et la falaise.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
