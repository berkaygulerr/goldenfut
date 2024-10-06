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
  const [loading, setLoading] = useState(true); // İlk yüklemede loading
  const [error, setError] = useState(null);
  const [liveScores, setLiveScores] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchAllData(); // İlk veri yüklemesini başlat
    fetchLiveScore(); // Canlı skoru çek

    // Canlı skoru ve puan durumunu her 30 saniyede bir güncelle
    const intervalId = setInterval(async () => {
      fetchLiveScore(); // Canlı skoru güncelle
      fetchAllData(false); // Diğer güncellemeleri loading durumunu kullanmadan yap
    }, 30000); // 30000 ms = 30 saniye

    return () => clearInterval(intervalId); // Bileşen unmount olduğunda interval'i temizle
  }, []);

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

  const fetchAllData = async (initialLoad = true) => {
    if (initialLoad) setLoading(true); // Yükleme durumunu başlat

    try {
      const allData = await Promise.all(
        menuItems.map(async (item) => {
          const response = await fetch(
            `/api/puan-durumu?lig=${item.slug}&code=${item.code}`,
            {
              cache: "no-store",
            }
          );

          const data = await response.json();
          return data;
        })
      );

      setData(allData);

      const lastActiveTab = localStorage.getItem("lastActiveTab");
      setActiveTab(lastActiveTab ? Number(lastActiveTab) : 0);
    } catch {
      setError("Veri alınırken hata oluştu");
    } finally {
      if (initialLoad) setLoading(false); // İlk yüklemede loading durumunu bitir
    }
  };

  const fetchLiveScore = async () => {
    try {
      const response = await fetch("/api/live-score");

      if (!response.ok) {
        throw new Error(`HTTP hatası: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        console.warn("Canlı skor verisi boş döndü!");
      } else {
        setLiveScores(data);
      }
    } catch (error) {
      console.error("Canlı skor verisi çekilirken hata oluştu:", error);
    }
  };

  if (loading) return <p>Veriler yükleniyor...</p>; // Yalnızca ilk yüklemede gösterilecek
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className={`${montserrat.className} m-2.5 md:m-0 text-xs sm:text-sm md:text-base`}
    >
      <h1
        className={`${michroma.className} text-xl md:text-3xl font-bold text-center mb-4`}
      >
        Canlı Puan Durumu
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
                      <td className="px-1 py-2 sm:px-4 text-white flex">
                        <span className="text-foreground font-bold w-5 text-center">
                          {team.rank}
                        </span>
                        <span className="ml-1 md:ml-3">{team.team}</span>{" "}
                        {liveScores
                          ? liveScores.map((liveScore) => {
                              const isHomeTeam =
                                team.id === liveScore.homeTeam.id;
                              const isAwayTeam =
                                team.id === liveScore.awayTeam.id;

                              const [homeScore, awayScore] = liveScore.score
                                .split(":")
                                .map(Number);

                              if (isHomeTeam || isAwayTeam) {
                                let isHalfTime = liveScore.score.split(" ")[1];
                                let backgroundColor = "";
                                let textColor = "";

                                if (homeScore !== awayScore && !isHalfTime) {
                                  backgroundColor =
                                    (isHomeTeam && homeScore > awayScore) ||
                                    (isAwayTeam && awayScore > homeScore)
                                      ? "bg-green-600"
                                      : "bg-red-600";
                                } else if (isHalfTime) {
                                  backgroundColor = "bg-foreground";
                                  textColor = "text-background";
                                } else {
                                  backgroundColor = "bg-gray-500"; // Beraberlik durumu
                                }

                                return (
                                  <span
                                    key={liveScore.time} // Benzersiz key (zamanı kullanıyoruz)
                                    className={`px-1.5 py-0.5 font-semibold text-xs md:text-sm rounded-md ml-auto ${backgroundColor} ${textColor}`}
                                  >
                                    {liveScore.score.split(" ")[0]}{" "}
                                    {liveScore.score.split(" ")[1]
                                      ? "İY"
                                      : null}
                                  </span>
                                );
                              }

                              return null;
                            })
                          : null}
                      </td>
                      {[
                        "play",
                        "win",
                        "draw",
                        "lose",
                        "goalfor",
                        "goalagainst",
                        "goaldistance",
                      ].map((key) => (
                        <td key={key} className="px-1 py-2 sm:px-4 text-center">
                          {team[key]}
                        </td>
                      ))}
                      <td className="px-1 py-2 sm:px-4 text-center text-white font-bold">
                        {team.point}
                      </td>
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
