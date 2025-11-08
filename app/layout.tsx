/* ============================================
   CHANGELOG
   - 2025-11-08: Add required <html> and <body>
                 wrapper for App Router root layout.
   ============================================
   ANCHOR: ROOT_LAYOUT
*/
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Southwest Virginia Chihuahua — Puppy Portal",
  description: "Customer portal with protected admin dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning avoids minor diffs with inline styles */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
