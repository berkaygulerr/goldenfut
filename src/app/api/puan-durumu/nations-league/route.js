import cheerio from "cheerio";
import fs from "fs";
import path from "path";
import axios from "axios";

// JSON dosyasından takım isimlerini oku
function readTeamNamesFromJson() {
  const filePath = path.join(process.cwd(), "data", "teamNames.json");
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }
  return []; // Dosya yoksa boş dizi döner
}

const groupNamesTr = [
  "A LİGİ, 1. GRUP",
  "A LİGİ, 2. GRUP",
  "A LİGİ, 3. GRUP",
  "A LİGİ, 4. GRUP",
  "B LİGİ, 1. GRUP",
  "B LİGİ, 2. GRUP",
  "B LİGİ, 3. GRUP",
  "B LİGİ, 4. GRUP",
  "C LİGİ, 1. GRUP",
  "C LİGİ, 2. GRUP",
  "C LİGİ, 3. GRUP",
  "C LİGİ, 4. GRUP",
  "D LİGİ, 1. GRUP",
  "D LİGİ, 2. GRUP",
];

export async function GET(req) {
  try {
    const url = "https://www.foxsports.com/soccer/nations-league/standings";

    const response = await axios.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 saniye
    });

    if (response.status !== 200)
      throw new Error(`HTTP hata: ${response.status}`);

    const data = response.data;
    const $ = cheerio.load(data);

    const standings = {};
    const teamNames = readTeamNamesFromJson(); // JSON'dan takım isimlerini oku

    // Takım isimlerini bir nesneye çevir (id => team)
    const teamMap = {};
    teamNames.forEach((team) => {
      teamMap[team.id] = team.team; // id'ye göre takım ismini eşleştir
    });

    $("table").each((index, element) => {
      const groupName = groupNamesTr[index];

      standings[groupName] = [];

      $(element)
        .find("tbody tr")
        .each((_, row) => {
          const cols = $(row).find("td");
          const teamDataURI =
            $(cols[1]).find("a.table-entity-name").attr("data-uri") || "";
          const id = teamDataURI ? teamDataURI.split("/").pop() : null;

          // Eşleşmiş takım ismini al
          const teamNameTr = teamMap[id] || "Bilinmeyen Takım"; // Eğer id yoksa varsayılan isim

          const teamData = {
            rank: $(cols[0]).text().trim(),
            team: teamNameTr, // Eşleşmiş takım ismi
            id: id,
            played: $(cols[2]).text().trim(),
            win: $(cols[4]).text().trim().split("-")[0] || "0",
            draw: $(cols[4]).text().trim().split("-")[1] || "0",
            lose: $(cols[4]).text().trim().split("-")[2] || "0",
            goalfor: $(cols[5]).text().trim(),
            goalagainst: $(cols[6]).text().trim(),
            goaldistance: $(cols[7]).text().trim(),
            point: $(cols[3]).text().trim(),
            logo: $(cols[1]).find("img").attr("src"),
            league: "nations-league",
          };

          standings[groupName].push(teamData);
        });
    });

    return new Response(JSON.stringify(standings, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        revalidate: 0, // ISR'yi kapatır, sayfa her istekte yeniden oluşturulur
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Veri alınırken bir hata oluştu" }),
      { status: 500 }
    );
  }
}
