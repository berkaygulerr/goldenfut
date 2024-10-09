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
  // Diğer takımlar eklenebilir
};

const logoName = {
  Samsunspor: "sm",
  Beşiktaş: "bjk",
  Eyüpspor: "eyp",
  "Bodrum FK": "bdr",
  Hatayspor: "hty",
  "Adana Demirspor": "ads",
};

// Takım adını kontrol edip, gerekiyorsa Türkçeye çeviren fonksiyon
function convertTeamName(teamName) {
  return teamNameMap[teamName] || teamName; // Eğer haritada varsa çevir, yoksa olduğu gibi bırak
}

// Küme düşen takımları belirleyen fonksiyon
function getRelegatedTeams(standingsData, lig) {
  const relegatedTeams = [];
  switch (lig) {
    case "turkish-super-lig":
      // Son 4 takım küme düşer
      relegatedTeams.push(...standingsData.slice(-4).map((team) => team.team));
      break;
    case "premier-league":
    case "la-liga":
    case "serie-a":
      // Son 3 takım küme düşer
      relegatedTeams.push(...standingsData.slice(-3).map((team) => team.team));
      break;
    case "ligue1":
    case "bundesliga":
      // Son 2 takım küme düşer
      relegatedTeams.push(...standingsData.slice(-2).map((team) => team.team));
      break;
    default:
      break;
  }
  return relegatedTeams;
}

function getRelegatePlayoffTeams(standingsData, lig) {
  const relegatePlayoffTeams = [];

  switch (lig) {
    case "bundesliga":
    case "ligue1":
      relegatePlayoffTeams.push(standingsData[standingsData.length - 3].team);
      break;

    default:
      break;
  }

  return relegatePlayoffTeams;
}

// Avrupa kupalarına katılımı sıraya ve lige göre belirleyen fonksiyon
function determineEuropeanLeague(lig, rank) {
  switch (lig) {
    case "turkish-super-lig":
      if (rank === 1) return "Champions League";
      if (rank === 2) return "Champions League Qualifiers";
      if (rank === 3) return "Europa League";
      if (rank === 4) return "Conference League";
      return null;
    case "premier-league":
      if (rank <= 4) return "Champions League";
      if (rank === 5) return "Europa League";
      return null;
    case "la-liga":
    case "serie-a":
    case "bundesliga":
      if (rank <= 4) return "Champions League";
      if (rank === 5) return "Europa League";
      if (rank === 6) return "Conference League";
      return null;
    case "ligue1":
      if (rank <= 3) return "Champions League";
      if (rank === 4) return "Champions League Qualifiers";
      if (rank === 5) return "Europa League";
      if (rank === 6) return "Conference League Qualifiers";
      return null;
    default:
      return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lig = searchParams.get("lig"); // Lig parametresini al

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

      let teamName = $(element).find("td:nth-child(2)").text().trim(); // Takım adı
      teamName = convertTeamName(teamName); // Takım adını haritaya göre dönüştür

      const team = teams.find((t) => t.name === teamName); // teams dizisinde eşleşen takımı bul
      const logo = logoName[teamName]
        ? `/logos/${logoName[teamName]}.webp`
        : $(element).find("td:nth-child(2) img").attr("src"); // Logo URL'si

      const rank = parseInt(
        $(element).find("td:nth-child(1)").text().trim(),
        10
      ); // Sıra bilgisini al
      const europeanCompetition = determineEuropeanLeague(lig, rank); // Lig ve sıraya göre Avrupa turnuvasını belirle

      standingsData.push({
        rank,
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
        league: lig, // Lig bilgisini buradan al
        europeanCompetition, // Avrupa turnuvasını ekle
        relegationStatus: null, // Düşme durumu burada tanımlanıyor
      });
    });

    // Küme düşen takımları belirle
    const relegatedTeams = getRelegatedTeams(standingsData, lig);
    const relegatePlayoffTeams = getRelegatePlayoffTeams(standingsData, lig);

    // Düşme durumunu güncelle
    standingsData.forEach((team) => {
      if (relegatedTeams.includes(team.team)) {
        team.relegationStatus = true;
      } else if (relegatePlayoffTeams.includes(team.team)) {
        team.relegationStatus = "playoff";
      }
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
