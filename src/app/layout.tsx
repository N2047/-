import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "अपाङ्गता सूचना केन्द्र (DIC) | Disability Information Center",
  description: "अपाङ्गता सम्बन्धी कानुन, नीति, स्थानीय तह वार्षिक कार्यसम्पादन प्रतिवेदन र तथ्यांकको एकीकृत डिजिटल केन्द्र (कोशी प्रदेश र नेपाल)",
  keywords: ["अपाङ्गता सूचना केन्द्र", "Disability Information Center", "DIC Nepal", "Koshi Province Disability Report", "Disability Rights Act", "अपाङ्गता सहायता सहजकर्ता"],
  authors: [{ name: "Disability Information Center (DIC) Nepal" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
