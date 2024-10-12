import axios from "axios";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

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

    const response = await axios.request(options, { cache: "no-store" });
    const data = response.data;
    const standings = data.response.standings;

    const teamTranslations = loadTeamTranslations();

    const groups = {};

    standings.forEach((standing, index) => {
      const groupName = groupNamesTr[index];

      groups[groupName] = [];

      standing.rows.forEach((team) => {
        const teamData = {
          rank: team.position,
          team: teamTranslations[team.id]?.name || team.team.name,
          id: team.id,
          played: team.matches,
          win: team.wins,
          draw: team.draws,
          lose: team.losses,
          goalfor: team.scoresFor,
          goalagainst: team.scoresAgainst,
          goaldistance: team.scoresFor - team.scoresAgainst,
          point: team.points,
          logo: teamTranslations[team.id]?.logo,
          league: "nations-league",
        };

        groups[groupName].push(teamData);
      });
    });

    return NextResponse.json(groups, {
      headers: {
        "Cache-Control": "public, max-age=15, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Veri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
