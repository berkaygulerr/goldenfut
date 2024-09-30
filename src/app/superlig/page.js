"use client";

import React, { useEffect, useState } from "react";
import { Michroma } from "next/font/google";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const michroma = Michroma({ weight: "400", subsets: ["latin"] });

export default function StandingsPage() {
  const [data, setData] = useState([]); // Başlangıçta boş bir dizi
  const [error, setError] = useState(null); // Hata durumu

  const fetchData = async () => {
    try {
      const res = await fetch("https://www.goldenfut.com/api/standings", {
        headers: {
          authorization: process.env.API_KEY,
        },
        cache: "no-store", // Önbelleği devre dışı bırakır
      });

      if (!res.ok) {
        throw new Error("Network response was not ok"); // Hata fırlat
      }

      const result = await res.json(); // JSON verisini al
      setData((prevData) => {
        // Önceki veriyi koruyarak güncelle
        return result.result.map((team, index) => ({
          ...team,
          rank: index + 1, // Sıralamayı güncelle
        }));
      });
    } catch (error) {
      console.error("Failed to fetch data:", error); // Hata mesajını konsola yazdır
      setError(error.message); // Hata mesajını state'e ata
    }
  };

  useEffect(() => {
    fetchData(); // Bileşen yüklendiğinde veriyi çek
    console.log('deneme');
    const intervalId = setInterval(fetchData, 60000); // Her 2 saniyede bir veriyi güncelle
    return () => clearInterval(intervalId); // Bileşen unmount olduğunda interval'i temizle
  }, []);

  if (error) return <p>Error: {error}</p>; // Hata mesajı

  return (
    <div className={`container mx-auto p-6 ${montserrat.className}`}>
      <h1
        className={`${michroma.className} text-3xl font-bold text-center mb-4`}
      >
        Süper Lig Sıralaması
      </h1>
      <div className="overflow-hidden rounded-lg shadow-lg">
        <table className="min-w-full border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-foreground text-black uppercase text-sm">
              <th className="py-3 px-4 text-left">Sıra</th>
              <th className="py-3 px-4 text-left">Takım</th>
              <th className="py-3 px-4 text-left">OM</th>
              <th className="py-3 px-4 text-left">G</th>
              <th className="py-3 px-4 text-left">B</th>
              <th className="py-3 px-4 text-left">M</th>
              <th className="py-3 px-4 text-left">AG</th>
              <th className="py-3 px-4 text-left">YG</th>
              <th className="py-3 px-4 text-left">A</th>
              <th className="py-3 px-4 text-left">Puan</th>
            </tr>
          </thead>
          <tbody>
            {data.map((team, index) => (
              <tr
                key={team.team}
                className={`${
                  index % 2 === 0 ? "bg-transparent" : "bg-zinc-800"
                } hover:bg-zinc-700`}
              >
                <td className="px-4 py-2 font-bold">{team.rank}</td>
                <td className="px-4 py-2 text-white">{team.team}</td>
                <td className="px-4 py-2">{team.play}</td>
                <td className="px-4 py-2">{team.win}</td>
                <td className="px-4 py-2">{team.draw}</td>
                <td className="px-4 py-2">{team.lose}</td>
                <td className="px-4 py-2">{team.goalfor}</td>
                <td className="px-4 py-2">{team.goalagainst}</td>
                <td className="px-4 py-2">{team.goaldistance}</td>
                <td className="px-4 py-2 text-white font-bold">{team.point}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
