import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/ui/Navbar";
import { getCurrentUser } from "@/lib/getCurrentUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextImg",
  description: "Image gallery platform",
};

const themeInitScript = `
  (function () {
    try {
      var savedTheme = window.localStorage.getItem("nextimg-theme");
      var theme = savedTheme === "light" ? "light" : "dark";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
    } catch (error) {
      document.documentElement.classList.add("dark");
    }
  })();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/* Navbar */}
        <Navbar
          user={
            currentUser
              ? {
                  id: currentUser.id,
                  username: currentUser.username,
                  image: currentUser.image,
                }
              : null
          }
        />

        <main className="pt-16 px-4">{children}</main>
      </body>
    </html>
  );
}
