import axios from "axios";
import { NextResponse } from "next/server";
import cheerio from "cheerio";

export async function GET() {
  try {
    // Transfermarkt canlı skor sayfasının URL'si
    const url = "https://www.transfermarkt.com/live/";

    // Sayfanın HTML içeriğini al
    const { data } = await axios.get(url);

    // Cheerio'yu kullanarak HTML içeriğini parse et
    const $ = cheerio.load(data);

    // 'kategorie' sınıfına sahip divleri seç
    const categories = $(".kategorie");

    // Verileri saklamak için bir dizi
    const liveScores = [];

    // İlk 5 ve 19. div için tabloyu al
    categories.slice(0, 5).each((index, element) => {
      const scoreTable = $(element).next(".livescore"); // hemen altındaki livescore tablosu
      if (scoreTable.length) {
        // Tablo satırlarını seç
        scoreTable.find("tbody tr").each((i, row) => {
          const time = $(row).find("td:nth-child(1)").text().trim();
          const homeTeam = $(row).find("td:nth-child(3)").text().trim();
          const score = $(row).find("td:nth-child(4)").text().trim();
          const awayTeam = $(row).find("td:nth-child(5)").text().trim();

          // Eğer time verisi ' ile bitiyorsa, verileri diziye ekle
          if (time.endsWith("'")) {
            liveScores.push({ time, homeTeam, score, awayTeam });
          }
        });
      }
    });

    // 19. div için tabloyu al
    const scoreTable19 = categories.eq(18).next(".livescore"); // 19. divin hemen altındaki livescore tablosu
    if (scoreTable19.length) {
      // Tablo satırlarını seç
      scoreTable19.find("tbody tr").each((i, row) => {
        const time = $(row).find("td:nth-child(1)").text().trim();
        const homeTeam = $(row).find("td:nth-child(3)").text().trim();
        const score = $(row).find("td:nth-child(4)").text().trim();
        const awayTeam = $(row).find("td:nth-child(5)").text().trim();

        // Eğer time verisi ' ile bitiyorsa, verileri diziye ekle
        if (time.endsWith("'")) {
          liveScores.push({ time, homeTeam, score, awayTeam });
        }
      });
    }

    // Sonuçları yazdır
    console.log("Seçilen canlı skorlar:", liveScores);

    // JSON formatında cevap döndür
    return NextResponse.json(liveScores);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Veri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
