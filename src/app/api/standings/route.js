import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "data.json");
const UPDATE_HOUR = 22; // 22:00'de güncelle

export async function GET() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toISOString().split("T")[0]; // Bugünün tarihi
  let data;

  try {
    const jsonData = fs.readFileSync(DATA_FILE, "utf-8");
    data = JSON.parse(jsonData);
  } catch (error) {
    console.error("Data file not found, fetching new data.");
    data = { lastUpdated: null, content: null }; // Başlangıç durumu
  }

  // Eğer veri yoksa veya güncellemeler tarihi bugün değilse ve saat 22:00 ise güncelle
  const lastUpdatedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toISOString().split("T")[0]
    : null;

  if (lastUpdatedDate !== currentDate && currentHour === UPDATE_HOUR) {
    const res = await fetch(
      "https://api.collectapi.com/football/league?data.league=super-lig",
      {
        headers: {
          authorization: process.env.API_KEY,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: res.status }
      );
    }

    const result = await res.json();
    data = { lastUpdated: now.toISOString(), content: result }; // Güncellenmiş veri ve zaman

    // Yeni veriyi dosyaya yaz
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  }

  return NextResponse.json(data.content);
}
