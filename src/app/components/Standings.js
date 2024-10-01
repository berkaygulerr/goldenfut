"use client";

import React, { useEffect, useRef, useState } from "react";
import { Michroma, Montserrat } from "next/font/google";

// Font ayarları
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

export default function Standings() {
  const menuItems = [
    { lig: "Super Lig", slug: "super-lig" },
    { lig: "Premier Lig", slug: "ingiltere-premier-ligi" },
    { lig: "La Liga", slug: "ispanya-la-liga" },
    { lig: "Bundesliga", slug: "almanya-bundesliga" },
    { lig: "Serie A", slug: "italya-serie-a-ligi" },
    { lig: "Ligue 1", slug: "fransa-ligue-1" },
  ];

  const [activeTab, setActiveTab] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const lastActiveTab = localStorage.getItem("lastActiveTab");
      if (lastActiveTab) {
        setActiveTab(Number(lastActiveTab));
      } else {
        setActiveTab(0);
      }
    }
  }, [data]);

  useEffect(() => {
    if (tableContainerRef.current) {
      const tableWidth = tableContainerRef.current.offsetWidth;
      tableContainerRef.current.scrollTo({
        left: tableWidth * activeTab,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    localStorage.setItem("lastActiveTab", index);
  };

  const fetchAllData = async () => {
    try {
      const allData = await Promise.all(
        menuItems.map((item) =>
          fetch(`/api/standings?lig=${item.slug}`).then((res) => res.json())
        )
      );
      setData(allData.map((result) => result.result));
    } catch (error) {
      setError("Veri alınırken hata oluştu");
    }
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className={`${montserrat.className}`}>
      <h1
        className={`${michroma.className} text-xl md:text-3xl font-bold text-center mb-4`}
      >
        Puan Durumu
      </h1>
      <div className="flex justify-center w-full overflow-x-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full p-2 md:p-4 rounded-t-lg md:text-base text-xs
              ${
                activeTab === index
                  ? "bg-foreground font-bold text-background"
                  : "bg-transparent text-zinc-400 hover:bg-zinc-800 focus:bg-zinc-700"
              }
            `}
            onClick={() => handleTabClick(index)}
          >
            {item.lig}
          </button>
        ))}
      </div>
      {/* Tablolar Konteyneri */}
      <div className="flex overflow-x-hidden w-full" ref={tableContainerRef}>
        {menuItems.map((item, index) => (
          <div
            className="flex-none w-full min-w-[240px] sm:min-w-[280px] md:min-w-[350px]"
            key={index}
          >
            <table className="min-w-full border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-foreground text-background uppercase text-xs sm:text-sm md:text-base">
                  <th className="py-1 sm:px-3 xl:py-3 lg:px-3 text-left">Takım</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">OM</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">G</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">B</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">M</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">AG</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">YG</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">A</th>
                  <th className="py-1 xl:py-3 lg:px-3 text-center">P</th>
                </tr>
              </thead>
              <tbody>
                {data[index]?.map((team, idx) => (
                  <tr
                    key={team.team}
                    className={`${
                      idx % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
                    } hover:bg-zinc-700`}
                  >
                    <td className="py-1 md:py-2 md:px-4 text-white flex items-center">
                      <span className="text-foreground font-bold w-5 text-center">
                        {team.rank}
                      </span>
                      <span className="ml-1 md:ml-3 ">{team.team}</span>
                    </td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">{team.play}</td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">{team.win}</td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">{team.draw}</td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">{team.lose}</td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">{team.goalfor}</td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">
                      {team.goalagainst}
                    </td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-center">
                      {team.goaldistance}
                    </td>
                    <td className="px-1 py-1 lg:py-2 lg:px-4 text-white font-bold text-center">
                      {team.point}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
