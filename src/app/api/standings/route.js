import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "data.json");
const UPDATE_HOUR = 22; // Güncellenme saati
const UPDATE_MINUTE = 15; // Güncellenme dakikası

export async function GET() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDate = now.toISOString().split("T")[0]; // Bugünün tarihi
  let data;

  try {
    const jsonData = fs.readFileSync(DATA_FILE, "utf-8");
    data = JSON.parse(jsonData);
  } catch (error) {
    console.error("Data file not found, fetching new data.");
    data = { lastUpdated: null, content: null }; // Başlangıç durumu
  }

  // Eğer veri yoksa veya güncellemeler tarihi bugünden önceyse güncelle
  const lastUpdatedDate = data.lastUpdated
    ? new Date(data.lastUpdated).toISOString().split("T")[0]
    : null;

  // Güncelleme için koşul: Saat 22:15 olduğunda ve güncel tarih lastUpdated'dan farklıysa
  if (
    (currentHour >= UPDATE_HOUR && currentMinute >= UPDATE_MINUTE && lastUpdatedDate !== currentDate) ||
    lastUpdatedDate === null // Veri yoksa hemen güncelle
  ) {
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
