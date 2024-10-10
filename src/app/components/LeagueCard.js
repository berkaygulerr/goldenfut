import Link from "next/link";
import Image from "next/image";
import { Michroma, Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const LeagueCard = ({ logo, name, link }) => {
  return (
    <Link
      href={link}
      className="inline-flex bg-zinc-800 rounded-lg p-5 mb-5 items-center focus:bg-zinc-700 hover:drop-shadow-xl hover:text-foreground group drop-shadow shadow hover:scale-105 transition-all"
    >
      <div className="flex items-center">
        <Image src={logo} alt={`${name} Logo`} width={100} height={64} />
        <h2 className={`${montserrat.className} text-md font-semibold ml-4 text-zinc-400 group-hover:text-foreground transition-all`}>
          {name}
        </h2>
      </div>
    </Link>
  );
};

export default LeagueCard;
