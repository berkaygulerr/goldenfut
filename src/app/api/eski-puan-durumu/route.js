import { NextResponse } from "next/server";
import cheerio from "cheerio";

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

  try {
    const url = `https://www.transfermarkt.com.tr/${lig}/tabelle/wettbewerb/${code}`;
    const response = await fetch(url, {
      next: {
        revalidate: 15,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status}`);
    }

    const data = await response.text();
    const $ = cheerio.load(data);
    const standings = [];

    $("table.items tbody tr").each((index, element) => {
      const rank = $(element).find("td.rechts").first().text().trim();
      const team = $(element).find("td.hauptlink a").text().trim();
      const teamId = $(element)
        .find("td.hauptlink a")
        .attr("href")
        .split("/")[4]; // ID'yi al

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
        id: teamId, // ID'yi ekle
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

    console.log("Veri Transfermarkt'tan çekildi.");

    return NextResponse.json(standings, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      revalidate: 0, // Her istekte güncelle
    });
  } catch (error) {
    console.error("Veri çekme hatası: ", error);
    return NextResponse.json({ error: "Veri çekme hatası" }, { status: 500 });
  }
}
