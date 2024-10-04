import Link from "next/link";
import Image from "next/image";
import { Michroma, Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const Header = () => {
  return (
    <div className="lg:container flex flex-col lg:flex-row items-center justify-between py-10 mx-auto space-y-6 lg:space-y-0">
      {/* Logo Section */}
      <div className="flex justify-center lg:justify-start w-full lg:w-auto">
        <Link href="/">
          <Image src="/logo.svg" width="67" height="0" alt="GoldenFut Logo" />
        </Link>
      </div>
      {/* Slogan Section */}
      <div className="text-center lg:text-left w-full lg:w-auto">
        <h2 className={`${montserrat.className} text-white`}>
          Futbolun <span className="text-foreground">Altın</span> Çağına
          Birlikte Tanık Olalım!
        </h2>
      </div>

      {/* Social Media Icons */}
      <div className="flex justify-center gap-7 w-full lg:w-auto">
        <a
          href="https://www.instagram.com/goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img
            src="icons/instagram-icon.svg"
            alt="Instagram"
            className="social-icon w-6"
          />
        </a>
        <a
          href="https://twitter.com/goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img
            src="icons/twitter-icon.svg"
            alt="X (Twitter)"
            className="social-icon w-6"
          />
        </a>
        <a
          href="https://www.tiktok.com/@goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img
            src="icons/tiktok-icon.svg"
            alt="TikTok"
            className="social-icon w-6"
          />
        </a>
      </div>
    </div>
  );
};

export default Header;
