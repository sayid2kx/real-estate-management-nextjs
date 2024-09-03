import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PremierPlaces",
  description: "You can sell and buy any property you want in here",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {children} </AuthProvider>
      </body>
    </html>
  );
}
