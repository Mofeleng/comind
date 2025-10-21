import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "CoMind | Collaborative Minds",
  description: "Have amazing coversations with your Collaborative Minds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <html lang="en">
        <body
          className={`${poppins.className} antialiased`}
        >
          {children}
        </body>
      </html>
    </TRPCReactProvider>
  );
}
