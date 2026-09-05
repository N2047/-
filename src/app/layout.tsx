import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { AccessibilityProvider } from "@/lib/accessibilityContext";
import DicChatbot from "@/components/chat/DicChatbot";

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
    <html lang="ne" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem("dic_accessibility_settings");
                if (s) {
                  var p = JSON.parse(s);
                  if (p.darkMode) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.setAttribute("data-theme", "dark");
                    document.documentElement.setAttribute("data-dark-mode", "true");
                  }
                  if (p.colorMode) {
                    document.documentElement.setAttribute("data-color-mode", p.colorMode);
                  }
                  if (p.fontSize) {
                    document.documentElement.setAttribute("data-font-size", p.fontSize);
                    var scale = p.fontSize === 180 ? '1.45rem' : p.fontSize === 150 ? '1.25rem' : '1rem';
                    document.documentElement.style.setProperty('--font-scale', scale);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <AccessibilityProvider>
            {children}
            <DicChatbot />
          </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
