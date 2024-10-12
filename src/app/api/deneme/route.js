import axios from "axios";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

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

    return NextResponse.json(standings, {
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
