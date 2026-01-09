import type { Metadata } from "next";
import { Inter, Montserrat, Open_Sans, Raleway } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "CampusCam - Connect with Real Students",
  description: "Random video chat between verified university students. No bots, no fake profiles. Real connections.",
  keywords: ["video chat", "university students", "campus", "student connections", "verified students", "random chat"],
  authors: [{ name: "CampusCam Team" }],
  creator: "CampusCam",
  publisher: "CampusCam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logoherored.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/logoherored.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://campuscam.com",
    title: "CampusCam - Connect with Real Students",
    description: "Random video chat between verified university students. No bots, no fake profiles. Real connections.",
    siteName: "CampusCam",
    images: [
      {
        url: "/logoherored.png",
        width: 1200,
        height: 630,
        alt: "CampusCam - Student Video Chat Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusCam - Connect with Real Students",
    description: "Random video chat between verified university students. No bots, no fake profiles. Real connections.",
    images: ["/logoherored.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#D53840",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logoherored.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/logoherored.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme and Browser Customization */}
        <meta name="theme-color" content="#D53840" />
        <meta name="msapplication-TileColor" content="#D53840" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional Meta Tags */}
        <meta name="application-name" content="CampusCam" />
        <meta name="apple-mobile-web-app-title" content="CampusCam" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} ${openSans.variable} ${raleway.variable} antialiased font-inter`}
      >
        {children}
      </body>
    </html>
  );
}
