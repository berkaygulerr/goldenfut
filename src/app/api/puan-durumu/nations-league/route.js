import axios from "axios";
import * as deepl from "deepl-node";
import fs from "fs";
import path from "path";

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

// Sunucu tarafı cache için global değişken
let cachedData = null;
let cacheTime = null;

function loadTeamTranslations() {
  try {
    const dataPath = path.join(process.cwd(), "data", "team-translations.json");
    const fileData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error loading team translations:", error);
    return {};
  }
}

export async function GET(req) {
  const cacheDuration = 15000; // 15 saniyelik cache süresi

  // Cache kontrolü
  if (cachedData && cacheTime && Date.now() - cacheTime < cacheDuration) {
    console.log("Veri cache'den alındı");
    return new Response(JSON.stringify(cachedData, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        revalidate: 0, // ISR'yi kapatır, sayfa her istekte yeniden oluşturulur
      },
    });
  }

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

    const teamTranslations = loadTeamTranslations(); // Dosyadan çevirileri yükle

    const groups = {};

    standings.forEach((standing, index) => {
      const groupName = groupNamesTr[index];

      groups[groupName] = [];

      standing.rows.forEach((team) => {
        const teamData = {
          rank: team.position,
          team: teamTranslations[team.id].name || team.team.name, // ID'ye göre çeviriyi al, yoksa orijinal ismi kullan
          id: team.id,
          played: team.matches,
          win: team.wins,
          draw: team.draws,
          lose: team.losses,
          goalfor: team.scoresFor,
          goalagainst: team.scoresAgainst,
          goaldistance: team.scoresFor - team.scoresAgainst,
          point: team.points,
          logo: teamTranslations[team.id].logo,
          league: "nations-league",
        };

        groups[groupName].push(teamData);
      });
    });

    // Yeni veriyi cache'e kaydet
    cachedData = groups;
    cacheTime = Date.now();

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
