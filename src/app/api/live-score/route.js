import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lig = searchParams.get("lig"); // Lig parametresini al

    let leagueId = "";

    switch (lig) {
      case "nations-league":
        leagueId = 1465;
        break;

      default:
        break;
    }

    const options = {
      method: "GET",
      url: "https://free-api-live-football-data.p.rapidapi.com/football-categories-live-unique-tournaments",
      params: { countryid: leagueId },
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
      },
    };

    const response = await axios.request(options, {
      headers: { "Cache-Control": "no-cache" },
    });

    const liveScoresAPI = response.data.response["Live"];
    const liveScores = [];

    if (liveScoresAPI) {
      await liveScoresAPI.forEach((liveScore, index) => {
        liveScores.push({
          homeTeam: {
            name: liveScore.homeTeam.name,
            id: liveScore.homeTeam.id,
          },
          score: `${liveScore.homeScore.current}:${liveScore.awayScore.current}`,
          awayTeam: {
            name: liveScore.awayTeam.name,
            id: liveScore.awayTeam.id,
          },
          league: lig,
        });
      });
    }

    // liveScores.push({
    //   time,
    //   homeTeam: {
    //     name: homeTeamName,
    //     id: homeTeamId,
    //   },
    //   score,
    //   awayTeam: {
    //     name: awayTeamName,
    //     id: awayTeamId,
    //   },
    //   league: leagueData.lig,
    // });

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
