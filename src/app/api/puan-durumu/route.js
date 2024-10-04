import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
import chromium from "chrome-aws-lambda";

// Ön bellek için değişkenler
let cache = {};
let lastFetchTime = {};
const CACHE_EXPIRY_TIME = 60000; // 1 dakika (ms cinsinden)

// Veriyi çekme fonksiyonu
const fetchData = async (lig) => {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  const url = `https://beinsports.com.tr/lig/${lig}/puan-durumu`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table.table", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table.table tr"));
      const puanDurumu = [];

      rows.forEach((row, index) => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 0 && index > 0) {
          const teamName = cols[1].innerText.trim();
          const logoImgs = cols[1].querySelectorAll("img");
          let logoSrc = "";

          for (const img of logoImgs) {
            const src = img.getAttribute("src");
            if (src && src.startsWith("https://")) {
              logoSrc = src;
              break;
            }
          }

          puanDurumu.push({
            rank: index,
            team: teamName,
            logo: logoSrc || "",
            played: cols[2].innerText.trim(),
            wins: cols[3].innerText.trim(),
            draws: cols[4].innerText.trim(),
            losses: cols[5].innerText.trim(),
            goalfor: cols[6].innerText.trim(),
            goalagainst: cols[7].innerText.trim(),
            goaldistance: cols[8].innerText.trim(),
            points: cols[9].innerText.trim(),
          });
        }
      });

      return puanDurumu;
    });

    // Verileri cache'le
    cache[lig] = data;
    lastFetchTime[lig] = Date.now();
    return data;
  } catch (error) {
    console.error("Veri çekme hatası:", error.message);
    throw new Error("Veri çekme işlemi sırasında bir hata oluştu.");
  } finally {
    await browser.close();
  }
};

// API'yi başlatma
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lig = searchParams.get("lig");

  if (!lig) {
    return NextResponse.json(
      { error: "Lütfen bir lig parametresi girin." },
      { status: 400 }
    );
  }

  if (cache[lig] && Date.now() - lastFetchTime[lig] < CACHE_EXPIRY_TIME) {
    return NextResponse.json({ result: cache[lig] }, { status: 200 });
  }

  try {
    const data = await fetchData(lig);
    return NextResponse.json({ result: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
