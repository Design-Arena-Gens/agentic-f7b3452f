import type { Metadata } from "next";
import NoContextMenu from "@/components/no-context-menu";
import "./globals.css";

export const metadata: Metadata = {
  title: "अनदेखी दस्तक",
  description:
    "A midnight knock transforms into a chilling visual and sonic horror vignette.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NoContextMenu>{children}</NoContextMenu>
      </body>
    </html>
  );
}
