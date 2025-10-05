// app/layout.js
import Script from "next/script";
import "./globals.css"; // se já tiver esse arquivo

export const metadata = {
  title: "EloTur - Conectando o Turismo Local",
  description: "Protótipo EloTur - hackathon",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        />
        {/* Tailwind config (antes do script do CDN) */}
        <Script
          id="tailwind-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              tailwind = {};
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      'elotur-blue': '#3B82F6',
                      'elotur-green': '#10B981',
                      'elotur-light': '#F3F4F6'
                    }
                  }
                }
              }
            `,
          }}
        />
        {/* Tailwind CDN */}
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-gray-50 min-h-screen font-inter">{children}</body>
    </html>
  );
}
// dentro do <head> do layout (antes do fechamento)
