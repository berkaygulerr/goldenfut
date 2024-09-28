import "./globals.css";

export const metadata = {
  title: "GoldenFut",
  description: "GoldenFut ile futbolun altın çağını yaşa!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex justify-center items-center">{children}</body>
    </html>
  );
}
