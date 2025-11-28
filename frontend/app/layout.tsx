import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <--- MỚI: Nhập cái loa vào

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Luckin Clone",
  description: "Dự án Cafe Tỷ Đô",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* <--- MỚI: Đặt cái loa ở đây để nó sẵn sàng hú */}
      </body>
    </html>
  );
}