import "./globals.css"
import { Anton, Lato } from "next/font/google"
import AppShell from "@/components/AppShell"
import { Toaster } from "sonner"

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" })
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" })

export const metadata = {
  title: "Carta Online - El Chalito",
  description: "Carta digital",
  icons: { icon: "/cactus-chalito.png" },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`bg-neutral-100 ${anton.variable} ${lato.variable}`}>
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  )
}
