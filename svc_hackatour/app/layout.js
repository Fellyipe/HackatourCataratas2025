// app/layout.js
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "EloTur - Gestão de Vouchers",
  description: "Protótipo EloTur - Gestão de vouchers digitais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        />
        {/* Tailwind config antes do CDN */}
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
                      'elotur-primary': '#1B324F',
                      'elotur-secondary': '#10B981',
                      'elotur-action': '#3B82F6',
                      'elotur-light': '#F3F4F6'
                    },
                    fontFamily: {
                      inter: ['Inter', 'ui-sans-serif', 'system-ui']
                    }
                  }
                }
              };
            `,
          }}
        />
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-elotur-light font-inter antialiased text-gray-800">
        {children}
      </body>
    </html>
  );
}
