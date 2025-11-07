import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Product Listing",
  description: "E-commerce product listing with filters and pagination",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* Navbar always at top */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

        {/* Footer always at bottom */}
        <Footer />
      </body>
    </html>
  );
}
