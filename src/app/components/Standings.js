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
          {Array.from({ length: 15 }).map((_, idx) => (
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
          const response = await fetch(`/api/puan-durumu?lig=${item.slug}`, {
            cache: "no-store",
          });
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

      // Eğer API'den dönen veri varsa, liveScores'u güncelle
      if (data && data.length > 0) {
        setLiveScores(data);
      } else {
        // Eğer API'den dönen veri yoksa, liveScores'u boş bir diziye set et
        setLiveScores([]);
        console.warn("Canlı skor verisi boş döndü!");
      }
    } catch (error) {
      console.error("Canlı skor verisi çekilirken hata oluştu:", error);
    }
  };

  // Eğer loading durumunda isek, StandingsPlaceholder'ı göster
  if (loading) {
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
              key={item.slug}
              activeTab={activeTab}
              item={item}
              index={index}
              handleTabClick={handleTabClick}
            />
          ))}
        </div>
        <StandingsPlaceholder
          tableHeader={["OM", "G", "B", "M", "AG", "YG", "A", "P"]}
        />
      </div>
    );
  }

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
            key={item.slug}
            activeTab={activeTab}
            item={item}
            index={index}
            handleTabClick={handleTabClick}
          />
        ))}
      </div>
      <div
        className="flex overflow-x-hidden w-full text-sm"
        ref={tableContainerRef}
      >
        {menuItems.map((item, index) => (
          <Table
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
      <ColorLegend /> {/* Renk bilgilendirmesini buraya ekliyoruz */}
    </div>
  );
};

const ColorLegend = () => (
  <div className="py-1 rounded-lg">
    <div className="flex flex-wrap gap-4 mt-2">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-blue-600"></div>
        <span className="ml-2 text-white">Şampiyonlar Ligi</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-blue-800"></div>
        <span className="ml-2 text-white">Şampiyonlar Ligi Eleme</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-orange-600"></div>
        <span className="ml-2 text-white">Avrupa Ligi</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-600"></div>
        <span className="ml-2 text-white">Konferans Ligi</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-800"></div>
        <span className="ml-2 text-white">Konferans Ligi Eleme</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-orange-700"></div>
        <span className="ml-2 text-white">Düşme Play-off</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-800"></div>
        <span className="ml-2 text-white">Düşme</span>
      </div>
    </div>
  </div>
);

export default Standings;
