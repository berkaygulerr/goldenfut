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
    const options = {
      method: "GET",
      url: "https://free-api-live-football-data.p.rapidapi.com/football-league-standings-total",
      params: {
        leagueid: "10783",
        seasonid: "58337",
      },
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      },
    };

    const response = await axios.request(options, {
      headers: { "Cache-Control": "no-cache" },
    });
    const data = response.data;
    const standings = data.response.standings;

    const groups = {};

    const responseFox = await axios.get("https://www.foxsports.com/soccer/nations-league/standings", {
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (response.status !== 200)
      throw new Error(`HTTP hata: ${response.status}`);

    const dataFox = responseFox.data;
    const $ = cheerio.load(dataFox);
    const standingsFox = {};
    const teamNames = readTeamNamesFromJson(); // JSON'dan takım isimlerini oku

    // Takım isimlerini bir nesneye çevir (id => team)
    const teamMap = {};
    teamNames.forEach((team) => {
      teamMap[team.id] = team.team; // id'ye göre takım ismini eşleştir
    });

    await $("table").each((index, element) => {
      const groupName = groupNamesTr[index];

      standingsFox[groupName] = [];

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
            team: teamNameTr,
            logo: $(cols[1]).find("img").attr("src"),
          };

          standingsFox[groupName].push(teamData);
        });
    });

    await standings.forEach((standing, index) => {
      const groupName = groupNamesTr[index];

      groups[groupName] = [];

      standing.rows.forEach((team, index) => {
        const teamData = {
          rank: team.position,
          team: standingsFox[groupName][index].team,
          id: team.id,
          played: team.matches,
          win: team.wins,
          draw: team.draws,
          lose: team.losses,
          goalfor: team.scoresFor,
          goalagainst: team.scoresAgainst,
          goaldistance: team.scoresFor - team.scoresAgainst,
          point: team.points,
          logo: standingsFox[groupName][index].logo,
          league: "nations-league",
        };

        groups[groupName].push(teamData);
      });
    });

    return new Response(JSON.stringify(groups, null, 2), {
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
