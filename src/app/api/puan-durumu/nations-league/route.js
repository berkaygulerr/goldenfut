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

    await standings.forEach((standing, index) => {
      const groupName = groupNamesTr[index];

      groups[groupName] = [];

      standing.rows.forEach((team) => {
        const teamData = {
          rank: team.position,
          team: team.team.name,
          id: team.id,
          played: team.matches,
          win: team.wins,
          draw: team.draws,
          lose: team.losses,
          goalfor: team.scoresFor,
          goalagainst: team.scoresAgainst,
          goaldistance: team.scoresFor - team.scoresAgainst,
          point: team.points,
          logo: "",
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
