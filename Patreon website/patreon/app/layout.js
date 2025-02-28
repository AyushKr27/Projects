import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Coffee4Me",
  description: "This website is for coffee lovers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/>
        <div className="min-h-[87.83vh] bg-[#DDD0C8]">
        {children}
        </div>
        <Footer/>
        </body>
    </html>
  );
}