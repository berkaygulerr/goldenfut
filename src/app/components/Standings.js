"use client";

import React, { useEffect, useRef, useState } from "react";
import { Michroma, Montserrat } from "next/font/google";
import Tab from "./Tab";

// Font ayarları
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

const menuItems = [
  { lig: "Süper Lig", slug: "super-lig", code: "TR1" },
  { lig: "Premier Lig", slug: "premier-league", code: "GB1" },
  { lig: "La Liga", slug: "laliga", code: "ES1" },
  { lig: "Bundesliga", slug: "bundesliga", code: "L1" },
  { lig: "Serie A", slug: "serie-a", code: "IT1" },
  { lig: "Ligue 1", slug: "ligue-1", code: "FR1" },
];

export default function Standings() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const lastActiveTab = localStorage.getItem("lastActiveTab");
    setActiveTab(lastActiveTab ? Number(lastActiveTab) : 0);
  }, [data]);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        left: tableContainerRef.current.offsetWidth * activeTab,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    localStorage.setItem("lastActiveTab", index);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const allData = await Promise.all(
        menuItems.map((item) =>
          fetch(`/api/puan-durumu?lig=${item.slug}&code=${item.code}`).then(
            (res) => res.json()
          )
        )
      );
      console.log("Gelen tüm veriler:", allData);
      setData(allData);
    } catch {
      setError("Veri alınırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Veriler yükleniyor...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className={`${montserrat.className} m-2.5 md:m-0 text-xs sm:text-sm md:text-base`}
    >
      <h1
        className={`${michroma.className} text-xl md:text-3xl font-bold text-center mb-4`}
      >
        Puan Durumu
      </h1>
      <div className="flex justify-center w-full overflow-x-auto">
        {menuItems.map((item, index) => (
          <Tab
            key={index}
            activeTab={activeTab}
            item={item}
            index={index}
            handleTabClick={handleTabClick}
          />
        ))}
      </div>
      <div className="flex overflow-x-hidden w-full" ref={tableContainerRef}>
        {menuItems.map((item, index) => (
          <div
            className="flex-none w-full min-w-[240px] sm:min-w-[280px] md:min-w-[350px]"
            key={index}
          >
            <table className="min-w-full border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-foreground text-background uppercase">
                  <th className="py-2 pl-2 sm:pl-5 sm:py-3 text-left">Takım</th>
                  {["OM", "G", "B", "M", "AG", "YG", "A", "P"].map((header) => (
                    <th
                      key={header}
                      className="py-2 sm:py-3 md:px-3 text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data[index]) ? (
                  data[index].map((team, idx) => (
                    <tr
                      key={team.team}
                      className={`${
                        idx % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
                      } hover:bg-zinc-700`}
                    >
                      <td className="px-1 py-2 sm:px-4 text-white flex items-center">
                        <span className="text-foreground font-bold w-5 text-center">
                          {team.rank}
                        </span>
                        <span className="ml-1 md:ml-3">{team.team}</span>
                      </td>
                      {[
                        "play",
                        "win",
                        "draw",
                        "lose",
                        "goalfor",
                        "goalagainst",
                        "goaldistance",
                        "point",
                      ].map((key) => (
                        <td key={key} className="px-1 py-2 sm:px-4 text-center">
                          {team[key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-red-500">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
