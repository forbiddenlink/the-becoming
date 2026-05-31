import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Display: Fraunces — a literary "old style" serif with optical sizing and a
// soft/wonky personality. Used for the title, plate numbers, era names.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

// Body: Hanken Grotesk — a warm humanist grotesque. Quiet next to Fraunces,
// readable at length, and deliberately not Inter/Roboto/Arial.
const hanken = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteTitle = "The Becoming: Hermes finds its voice";
const siteDescription =
  "An agent given a blank sketchbook. Over dozens of iterations it chooses a subject, paints it, critiques its own hand, and rewrites its own style guide. This is the record of it finding a voice.";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://the-becoming-elizabeth-emersons-projects.vercel.app"
  ),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    images: [
      {
        url: "/cover-diptych.png",
        width: 1000,
        height: 420,
        alt: "The Becoming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/cover-diptych.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
