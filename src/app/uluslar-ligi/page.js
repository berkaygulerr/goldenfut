"use client";

import { useState, useEffect } from "react";
import Table from "../components/Table"; // Table bileşenini buraya dahil ediyorsun
import { Michroma, Montserrat } from "next/font/google";
import Image from "next/image";

// Font ayarları
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

const StandingsPlaceholder = () => {
  // Placeholder header names
  const placeholderHeaders = Array.from(
    { length: 4 },
    (_, idx) => `Placeholder ${idx + 1}`
  );

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-foreground text-background uppercase">
            {placeholderHeaders.map((header, idx) => (
              <th key={idx} className="py-2 sm:py-3 md:px-3 text-center">
                <div className="bg-foreground h-4 w-12 rounded animate-pulse"></div>{" "}
                {/* Placeholder */}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 15 adet Placeholder Row */}
          {Array.from({ length: 4 }).map((_, idx) => (
            <PlaceholderRow key={idx} idx={idx} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Placeholder Row Bileşeni
const PlaceholderRow = ({ idx }) => (
  <tr
    className={`${
      idx % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
    } hover:bg-zinc-700`}
  >
    {/* Placeholder için sıralama numarası */}
    <td className="px-1 py-2 sm:px-4 text-white flex items-center">
      <span className="text-foreground font-bold w-5 text-center animate-pulse bg-gray-500 rounded"></span>
      <div className="relative w-5 h-5 md:w-6 md:h-6 mx-2">
        <div className="bg-gray-500 animate-pulse w-full h-full rounded-full"></div>
      </div>
      <div className="bg-gray-500 animate-pulse h-4 w-24 rounded"></div>
    </td>
    {/* Placeholder hücreleri */}
    {Array.from({ length: 3 }).map((_, idx) => (
      <td key={idx} className="px-1 py-2 sm:px-4 text-center">
        <div className="bg-gray-500 animate-pulse h-4 w-12 rounded"></div>
      </td>
    ))}
  </tr>
);

const NationsLeague = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async (initialLoad = true) => {
    if (initialLoad) setLoading(true);

    try {
      const response = await fetch("/api/puan-durumu/nations-league", {
        cache: "no-store",
      });
      const data = await response.json();

      // Gelen veri bir obje olduğu için anahtarları ve değerleri grupluyoruz
      const groupArray = Object.keys(data).map((key) => ({
        name: key, // Grup adı
        teams: data[key], // Takım verileri
      }));

      setGroups(groupArray); // Grup dizisini set ediyoruz
    } catch (error) {
      console.error("API'den veri çekme hatası:", error);
    } finally {
      if (initialLoad) setLoading(false);
    }
  };

  // Eğer loading durumunda isek, StandingsPlaceholder'ı göster
  if (loading) {
    return (
      <div
        className={`${montserrat.className} m-2.5 md:m-0 text-xs sm:text-sm md:text-base flex flex-col justify-center items-center`}
      >
        <h1
          className={`${michroma.className} text-xl md:text-3xl font-bold text-center mb-4`}
        >
          Canlı Puan Durumu
        </h1>
        <div
          className={`${montserrat.className} container mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 w-full justify-center items-center`}
        >
          {Array.from({ length: 14 }).map((_, idx) => (
            <div key={idx} className="min-h-[200px] flex justify-between">
              <StandingsPlaceholder
                tableHeader={["OM", "G", "B", "M", "AG", "YG", "A", "P"]}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto px-4">
      <div className="flex gap-5 justify-center items-center mb-10">
        <Image
          src={"/images/nations.svg"}
          alt={`Logo`}
          width={120}
          height={64}
        />
        <h1 className={`${michroma.className} text-3xl font-bold`}>
          Canlı Puan Durumu
        </h1>
      </div>
      <div
        className={`${montserrat.className} grid grid-cols-1 xl:grid-cols-2 gap-8`}
      >
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="min-h-[200px] justify-between">
            <div className="inline-block text-xs sm:text-lg font-bold bg-foreground text-background p-3 rounded-t-lg">
              {group.name}
            </div>
            <Table
              data={group.teams}
              title={group.name}
              tableHeader={["OM", "G", "B", "M", "AG", "YG", "A", "P"]}
              tableData={[
                "played",
                "win",
                "draw",
                "lose",
                "goalfor",
                "goalagainst",
                "goaldistance",
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NationsLeague;
