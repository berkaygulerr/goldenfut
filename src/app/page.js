import Image from "next/image";
import { Michroma } from "next/font/google";

const michroma = Michroma({ weight: "400", subsets: ["latin"] });

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/logo.svg" width={150} height={150} alt="GoldenFut Logo" />
      <h1 className={`${michroma.className} text-4xl relative my-8`}>
        Çok Yakında
      </h1>
      <div className="flex justify-around w-full max-w-md">
        <a
          href="https://www.instagram.com/goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img
            src="icons/instagram-icon.svg"
            alt="Instagram"
            className="social-icon"
          />
        </a>
        <a
          href="https://twitter.com/goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img src="icons/twitter-icon.svg" alt="X (Twitter)" />
        </a>
        <a
          href="https://www.tiktok.com/@goldenfutcom"
          target="_blank"
          className="social-icon"
        >
          <img src="icons/tiktok-icon.svg" alt="TikTok" />
        </a>
      </div>
    </div>
  );
}
