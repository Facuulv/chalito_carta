import "./globals.css"
import localFont from "next/font/local"
import { Lato } from "next/font/google"
import AppShell from "@/components/AppShell"
import BrandingProvider from "@/components/BrandingProvider"
import { Toaster } from "sonner"

const bernier = localFont({
  src: "../../public/fonts/BERNIER-Regular.ttf",
  variable: "--font-bernier",
})
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" })

export const metadata = {
  title: "Carta Online - El Chalito",
  description: "Carta digital",
  icons: { icon: "/cactus-chalito.png" },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`bg-neutral-100 ${bernier.variable} ${lato.variable}`}>
        <BrandingProvider>
          <AppShell>{children}</AppShell>
        </BrandingProvider>
        <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  )
}
