import { NextResponse } from "next/server";
import cheerio from "cheerio";
import { teams } from "../../data/teams"; // teams dosyasından takımları al

// Takım adı dönüşüm haritası (sadece gerekli olanlar)
const teamNameMap = {
  "Goztepe SK": "Göztepe",
  "Kasimpasa S.K.": "Kasımpaşa",
  Basaksehir: "Başakşehir",
  Besiktas: "Beşiktaş",
  Fenerbahce: "Fenerbahçe",
  Eyupspor: "Eyüpspor",
  "Caykur Rizespor": "Ç. Rizespor",
  "Gazisehir Gaziantep FK": "Gaziantep FK",
  "BB Bodrumspor": "Bodrum FK",
  "Inter Milan": "Inter",
  "US Lecce": "Lecce",
  "AC Monza": "Monza",
  "Venezia FC": "Venezia",
  "Eintracht Fran.": "Eintracht Frankfurt",
  Marseille: "Marsilya",
  Athletic: "Athletic Bilbao",
  Betis: "Real Betis",
  Valladolid: "Real Valladolid",

  // Örnek: Türkçe olarak yazılması gereken başka takımlar varsa buraya ekleyebilirsin
  // Haritaya başka takım isimlerini ekleyebilirsin
};

// Takım adını kontrol edip, gerekiyorsa Türkçeye çeviren fonksiyon
function convertTeamName(teamName) {
  return teamNameMap[teamName] || teamName; // Eğer haritada varsa çevir, yoksa olduğu gibi bırak
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lig = searchParams.get("lig");

    const url = `https://www.foxsports.com/soccer/${lig}/standings`;

    // Sayfanın HTML içeriğini al
    const response = await fetch(url, {
      next: { revalidate: 15 },
    });

    if (!response.ok) throw new Error(`HTTP hata: ${response.status}`);

    const data = await response.text();
    const $ = cheerio.load(data);
    const standingsData = [];

    // Her bir 'tr' (satır) için verileri al
    $("tbody tr").each((_, element) => {
      const [wins, draws, losses] = $(element)
        .find("td:nth-child(5)")
        .text()
        .trim()
        .split("-");
      const logo = $(element).find("td:nth-child(2) img").attr("src"); // Logo URL'si

      let teamName = $(element).find("td:nth-child(2)").text().trim(); // Takım adı
      teamName = convertTeamName(teamName); // Takım adını haritaya göre dönüştür

      const team = teams.find((t) => t.name === teamName); // teams dizisinde eşleşen takımı bul

      standingsData.push({
        rank: $(element).find("td:nth-child(1)").text().trim(),
        team: teamName,
        id: team ? team.id : null, // Takım ID'sini ekle
        played: $(element).find("td:nth-child(3)").text().trim(),
        win: wins,
        draw: draws,
        lose: losses,
        goalfor: $(element).find("td:nth-child(6)").text().trim(),
        goalagainst: $(element).find("td:nth-child(7)").text().trim(),
        goaldistance: $(element).find("td:nth-child(8)").text().trim(),
        point: $(element).find("td:nth-child(4)").text().trim(),
        logo, // Logo URL'si ekleniyor
      });
    });

    return NextResponse.json(standingsData);
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { error: "Veri alınırken bir hata oluştu", detail: error.message },
      { status: 500 }
    );
  }
}
