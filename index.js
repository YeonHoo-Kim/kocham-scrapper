const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

// 수정 부분
const START_ID = 1; // 시작 id
const END_ID = 2469; // 종료 id
const INTERVAL = 0; // 조회 주기 (ms 단위)

const BASE_URL = "http://www.kocham.kr/theme/inet/sub/detail.php?wr_id=";
const HEADER = [
  "id",
  "Company name",
  "General Director",
  "Type of business",
  "Tel",
  "Area",
  "Address",
  "E-mail",
  "Homepage",
  "Number of staff",
  "Service",
];
const EXCLUDED_HEADER = ["Logo"];

async function start() {
  // node 환경에서 브라우저 접속
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const data = [HEADER];

  for (let i = START_ID; i <= END_ID; i++) {
    const row = await getRowData('t', i);
    data.push(row);
    printProgress(
      Math.round(((i - START_ID) / (END_ID - START_ID)) * 10000) / 100
    );
    await sleep(INTERVAL);
  }

  // 엑셀 추출
  exportToExcel(data);

  // 브라우저 종료
  await browser.close();
  console.log("\n종료되었습니다...");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printProgress(progress) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write("진행률: " + progress + "%");
}

async function getRowData(page, id) {
  // target 페이지 접속
  await page.goto(BASE_URL + id);

  // document (전체 페이지)
  const content = await page.content();
  const $ = cheerio.load(content);

  // row data 추출
  const rowData = [id];
  $("table.subtable_list tbody tr").each((_, row) => {
    $(row)
      .find("td")
      .each((_, cell) => {
        if (!EXCLUDED_HEADER.includes($(cell).siblings("th").text().trim())) {
          rowData.push($(cell).text().trim());
        }
      });
  });

  return rowData;
}
function exportToExcel(data) {
  const workbook = xlsx.utils.book_new();
  const sheetName = "kocham";

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  const outputFilePath = "kocham.xlsx";
  xlsx.writeFile(workbook, outputFilePath);
}

// 실행
start();
