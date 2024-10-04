import { NextResponse } from "next/server";
import fs from "fs/promises"; // Asenkron dosya işlemleri için
import path from "path";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lig = searchParams.get("lig") || "data"; // "lig" parametresini al
  const DATA_FILE = path.join(process.cwd(), "data", `${lig}.json`); // Dosya adını dinamik olarak ayarla
  const UPDATE_HOUR = 22; // Güncellenme saati
  const UPDATE_MINUTE = 15; // Güncellenme dakikası

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDate = now.toISOString().split("T")[0]; // Bugünün tarihi
  let data;

  try {
    // Eğer veri dosyası yoksa, yeni bir dosya oluştur
    const fileExists = await fs
      .access(DATA_FILE)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      console.error("Data file not found, fetching new data.");

      // API'den veri çek
      const res = await fetch(
        `https://api.collectapi.com/football/league?data.league=${lig}`,
        {
          headers: {
            authorization: process.env.API_KEY,
          },
          cache: "no-store",
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
      console.log("Writing new data to file...");
      await fs.writeFile(DATA_FILE, JSON.stringify(data));
      console.log("Data written successfully.");
    } else {
      const jsonData = await fs.readFile(DATA_FILE, "utf-8");
      data = JSON.parse(jsonData);
    }

    // Eğer veri yoksa veya güncellemeler tarihi bugünden önceyse güncelle
    const lastUpdatedDate = data.lastUpdated
      ? new Date(data.lastUpdated).toISOString().split("T")[0]
      : null;

    console.log("Last updated date:", lastUpdatedDate);
    console.log("Current date:", currentDate);

    // Şu anki saat 22:15 veya sonrasıysa ve son güncelleme tarihi bugünden farklıysa
    if (
      lastUpdatedDate !== currentDate &&
      (currentHour > UPDATE_HOUR ||
        (currentHour === UPDATE_HOUR && currentMinute >= UPDATE_MINUTE))
    ) {
      console.log(
        "Updating data because it is past 22:15 and the last update is from a different day."
      );

      const res = await fetch(
        `https://api.collectapi.com/football/league?data.league=${lig}`,
        {
          headers: {
            authorization: process.env.API_KEY,
          },
          cache: "no-store",
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
      console.log("Writing updated data to file...");
      await fs.writeFile(DATA_FILE, JSON.stringify(data));
      console.log("Updated data written successfully.");
    }

    return NextResponse.json(data.content);
  } catch (error) {
    console.error("Error handling data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
