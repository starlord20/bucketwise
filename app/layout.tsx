export const metadata = { title: 'Bucketwise — Household CFO' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin: 0, background: '#f4f5f7', color: '#17191d', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'}}>{children}</body>
    </html>
  );
}
