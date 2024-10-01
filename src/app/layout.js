import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "GoldenFut",
  description: "GoldenFut ile futbolun altın çağını yaşa!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
