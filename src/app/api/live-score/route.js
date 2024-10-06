import axios from "axios";
import { NextResponse } from "next/server";
import cheerio from "cheerio";

// 6 büyük ligin kodlarını tanımlıyoruz
const majorLeagues = [
  "Süper Lig",
  "Premier Lig",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
];

export async function GET() {
  try {
    // Transfermarkt canlı skor sayfasının URL'si
    const url = "https://www.transfermarkt.com/live/";

    // Sayfanın HTML içeriğini al
    const { data } = await axios.get(url, {
      headers: {
        "Cache-Control": "no-store", // Ön bellekleme devre dışı
        Pragma: "no-cache", // HTTP/1.0 için ön bellekleme devre dışı
        Expires: "0", // Geçerlilik süresini 0 yaparak ön belleklemeyi devre dışı bırak
      },
    });

    // Cheerio'yu kullanarak HTML içeriğini parse et
    const $ = cheerio.load(data);

    // 'kategorie' sınıfına sahip divleri seç
    const categories = $(".kategorie");

    // Verileri saklamak için bir dizi
    const liveScores = [];

    // İlk 25 kategori için tabloyu al
    categories.slice(0, 25).each((index, element) => {
      const leagueName = $(element).text().trim();

      // Eğer bu lig 6 büyük ligden biriyse, livescore tablosunu al
      if (majorLeagues.includes(leagueName)) {
        const scoreTable = $(element).next(".livescore"); // hemen altındaki livescore tablosu
        if (scoreTable.length) {
          // Tablo satırlarını seç
          scoreTable.find("tbody tr").each((i, row) => {
            const time = $(row).find("td:nth-child(1)").text().trim();
            const homeTeam = $(row)
              .find("td:nth-child(3)")
              .text()
              .trim()
              .split(" ")[0]; // İlk kelimeyi al
            const score = $(row).find("td:nth-child(4)").text().trim();
            const awayTeam = $(row)
              .find("td:nth-child(5)")
              .text()
              .trim()
              .split(" ")[0]; // İlk kelimeyi al

            // Eğer time verisi ' ile bitiyorsa, verileri diziye ekle
            if (time.endsWith("'")) {
              liveScores.push({ time, homeTeam, score, awayTeam, leagueName });
            }
          });
        }
      }
    });

    // Cache-Control başlığıyla cache'i devre dışı bırak
    return NextResponse.json(liveScores, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      revalidate: 0, // Her istekte güncelle
    });
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Veri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
