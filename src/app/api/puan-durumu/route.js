import { NextResponse } from "next/server";
import axios from "axios";
import cheerio from "cheerio";

// In-memory cache
let cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika (milisaniye)

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lig = searchParams.get("lig");
  const code = searchParams.get("code");

  if (!lig || !code) {
    return NextResponse.json(
      { error: "Lig ve code parametreleri gerekli" },
      { status: 400 }
    );
  }

  const cacheKey = `${lig}-${code}`;
  const now = Date.now();

  // Cache kontrolü
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    console.log("Veri cache'den alındı.");
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    // Transfermarkt URL'si
    const url = `https://www.transfermarkt.com.tr/${lig}/tabelle/wettbewerb/${code}`;
    const response = await axios.get(url);

    // Cheerio ile HTML'yi yükle
    const $ = cheerio.load(response.data);
    const standings = [];

    // Tabloyu seç ve veriyi çek
    $("table.items tbody tr").each((index, element) => {
      const rank = $(element).find("td.rechts").first().text().trim();
      const team = $(element).find("td.hauptlink a").text().trim();
      const play = $(element).find("td.zentriert:nth-child(4)").text().trim(); // Maç sayısı
      const win = $(element).find("td.zentriert:nth-child(5)").text().trim(); // Galibiyet sayısı
      const draw = $(element).find("td.zentriert:nth-child(6)").text().trim(); // Beraberlik sayısı
      const lose = $(element).find("td.zentriert:nth-child(7)").text().trim(); // Mağlubiyet sayısı
      const goalData = $(element)
        .find("td.zentriert:nth-child(8)")
        .text()
        .trim()
        .split(":");
      const goalfor = goalData[0]; // Atılan gol
      const goalagainst = goalData[1]; // Yenen gol
      const goaldistance = $(element)
        .find("td.zentriert:nth-child(9)")
        .text()
        .trim(); // Gollü fark
      const point = $(element).find("td.zentriert:nth-child(10)").text().trim(); // Puanlar
      const logoSrc = $(element).find("td.zentriert img").attr("src");

      standings.push({
        rank,
        team,
        play,
        win,
        draw,
        lose,
        goalfor,
        goalagainst,
        goaldistance,
        point,
        logo: logoSrc || null, // Logo URL
      });
    });

    // Cache'e veriyi kaydet
    cache[cacheKey] = {
      timestamp: now,
      data: standings,
    };

    console.log("Veri Transfermarkt'tan çekildi ve cache'lendi.");
    return NextResponse.json(standings);
  } catch (error) {
    console.error("Veri çekme hatası: ", error);
    return NextResponse.json({ error: "Veri çekme hatası" }, { status: 500 });
  }
}
