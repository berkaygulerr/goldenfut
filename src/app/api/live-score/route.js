import { NextResponse } from "next/server";
import cheerio from "cheerio";

// 6 büyük ligin kodlarını tanımlıyoruz
const majorLeagues = [
  { lig: "Süper Lig", code: "TR1" },
  { lig: "Premier Lig", code: "GB1" },
  { lig: "LaLiga", code: "ES1" },
  { lig: "Bundesliga", code: "L1" },
  { lig: "Serie A", code: "IT1" },
  { lig: "Ligue 1", code: "FR1" },
];

export async function GET() {
  try {
    // Transfermarkt canlı skor sayfasının URL'si
    const url = "https://www.transfermarkt.com/live/";

    // Fetch ile isteği yap
    const response = await fetch(url, {
      next: {
        revalidate: 15,
      },
    });

    // Eğer yanıt başarılı değilse hata fırlat
    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }

    // Yanıtın metin formatındaki içeriğini al
    const data = await response.text();

    // Cheerio'yu kullanarak HTML içeriğini parse et
    const $ = cheerio.load(data);

    // 'kategorie' sınıfına sahip divleri seç
    const categories = $(".kategorie");

    // Verileri saklamak için bir dizi
    const liveScores = [];

    // İlk 25 kategori için tabloyu al
    categories.slice(0, 25).each((index, element) => {
      const leagueName = $(element).text().trim();
      const leagueCode = $(element).find("a").attr("href").split("/").pop(); // href'ten kodu al

      // Eğer bu lig 6 büyük ligden biriyse, livescore tablosunu al
      const leagueData = majorLeagues.find((l) => l.code === leagueCode);
      if (leagueData) {
        const scoreTable = $(element).next(".livescore"); // hemen altındaki livescore tablosu
        if (scoreTable.length) {
          // Tablo satırlarını seç
          scoreTable.find("tbody tr").each((i, row) => {
            const time = $(row).find("td:nth-child(1)").text().trim();

            // Ev sahibi takım adı ve id'si
            const homeTeamElement = $(row).find("td:nth-child(3) a");
            const homeTeamName = homeTeamElement.text().trim();
            const homeTeamId = homeTeamElement.attr("href").split("/").pop();

            // Skor bilgisi
            const score = $(row).find("td:nth-child(4)").text().trim();

            // Deplasman takımı adı ve id'si
            const awayTeamElement = $(row).find("td:nth-child(5) a");
            const awayTeamName = awayTeamElement.text().trim();
            const awayTeamId = awayTeamElement.attr("href").split("/").pop();

            // Eğer time verisi ' ile bitiyorsa, verileri diziye ekle
            if (time.endsWith("'")) {
              liveScores.push({
                time,
                homeTeam: {
                  name: homeTeamName,
                  id: homeTeamId,
                },
                score,
                awayTeam: {
                  name: awayTeamName,
                  id: awayTeamId,
                },
                league: leagueData.lig,
              });
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
