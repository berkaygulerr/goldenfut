import React, { useEffect, useRef, useState } from "react";
import { Michroma, Montserrat } from "next/font/google";
import Table from "./Table";
import Tab from "./Tab";

// Font ayarları
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

const menuItems = [
  { lig: "Süper Lig", slug: "turkish-super-lig" },
  { lig: "Premier Lig", slug: "premier-league" },
  { lig: "LaLiga", slug: "la-liga" },
  { lig: "Bundesliga", slug: "bundesliga" },
  { lig: "Serie A", slug: "serie-a" },
  { lig: "Ligue 1", slug: "ligue1" },
];

const Standings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveScores, setLiveScores] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchAllData();
    fetchLiveScore();

    const intervalId = setInterval(() => {
      fetchLiveScore();
      fetchAllData(false);
    }, 30000);

    return () => clearInterval(intervalId);
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
    if (initialLoad) setLoading(true);

    try {
      const allData = await Promise.all(
        menuItems.map(async (item) => {
          const response = await fetch(
            `/api/puan-durumu?lig=${item.slug}`,
            { cache: "no-store" }
          );
          return await response.json();
        })
      );

      setData(allData);
      const lastActiveTab = localStorage.getItem("lastActiveTab");
      setActiveTab(lastActiveTab ? Number(lastActiveTab) : 0);
    } catch {
      setError("Veri alınırken hata oluştu");
    } finally {
      if (initialLoad) setLoading(false);
    }
  };

  const fetchLiveScore = async () => {
    try {
      const response = await fetch("/api/live-score");
      if (!response.ok) throw new Error(`HTTP hatası: ${response.status}`);

      const data = await response.json();
      if (data && data.length > 0) setLiveScores(data);
      else console.warn("Canlı skor verisi boş döndü!");
    } catch (error) {
      console.error("Canlı skor verisi çekilirken hata oluştu:", error);
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
        Canlı Puan Durumu
      </h1>
      <div className="flex justify-center w-full overflow-x-auto">
        {menuItems.map((item, index) => (
          <Tab
            key={item.code}
            activeTab={activeTab}
            item={item}
            index={index}
            handleTabClick={handleTabClick}
          />
        ))}
      </div>
      <div className="flex overflow-x-hidden w-full" ref={tableContainerRef}>
        {menuItems.map((item, index) => (
          <Table
            key={item.code}
            data={data[index]}
            liveScores={liveScores}
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
        ))}
      </div>
    </div>
  );
};

export default Standings;
