const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

// 수정 부분
const START_ID = 1; // 시작 id(페이지)
const END_ID = 216; // 종료 id(페이지)
const INTERVAL = 0; // 조회 주기 (ms 단위)

const BASE_URL =
  "https://kochamvietnam.com/service/directory/company/list?&cp=";
const HEADER = [
  "id",
  "지역",
  "분류",
  "회사명",
  "연락처",
  "주소",
  "최초 가입일",
  "회비 납부일",
];

let counter = 0;
const data = [HEADER];

async function start() {
  // node 환경에서 브라우저 접속
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (let i = START_ID; i <= END_ID; i++) {
    await getRowData(page, i);
    printProgress(
      Math.round(((i - START_ID) / (END_ID - START_ID)) * 10000) / 100
    );
    await sleep(INTERVAL);
  }

  // 엑셀 추출
  exportToExcel();

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
  let rowData = [];
  $("table tbody tr").each((index, row) => {
    if (index % 2 === 0) {
      rowData = [];
      let companyName = "";

      rowData.push(++counter); // id
      $(row)
        .find('td[rowspan="2"]')
        .each((_, cell) => {
          // 지역
          rowData.push($(cell).text().trim());
        });
      // 분류
      if (
        !$(row).find("td > div.box-flex > div.box-text > p > small > strong")
          .length
      ) {
        rowData.push("");
      } else {
        $(row)
          .find("td > div.box-flex > div.box-text > p > small > strong")
          .each((_, cell) => {
            rowData.push($(cell).text().trim());
          });
      }
      $(row)
        .find("td > div.box-flex > div.box-text > p > strong")
        .each((_, cell) => {
          // 회사명(한글)
          companyName += $(cell).text().trim();
        });
      $(row)
        .find("td > div.box-flex > div.box-text > small")
        .each((_, cell) => {
          // 회사명(영문)
          companyName += $(cell).text().trim();
          rowData.push(companyName);
        });
      // 연락처
      if (!$(row).find("td > p").length) {
        rowData.push("");
      } else {
        $(row)
          .find("td > p")
          .each((_, cell) => {
            const str = $(cell).text().trim();
            rowData.push(str && $(cell).text().split(":")[1].trim());
          });
      }
    } else {
      if (
        !$(row).find('td[colspan="2"] > div.pos > div.block-add > p').length
      ) {
        rowData.push("");
      } else {
        $(row)
          .find('td[colspan="2"] > div.pos > div.block-add > p')
          .each((_, cell) => {
            // 주소
            const str = $(cell).text().trim();
            rowData.push(str && $(cell).text().split(":")[1].trim());
          });
      }
      if (
        !$(row).find(
          'td[colspan="2"] > div.pos > div.korcham_member > p:nth-child(1)'
        ).length
      ) {
        rowData.push("");
      } else {
        $(row)
          .find(
            'td[colspan="2"] > div.pos > div.korcham_member > p:nth-child(1)'
          )
          .each((_, cell) => {
            // 최초가입일
            const str = $(cell).text().trim();
            rowData.push(str && $(cell).text().split(":")[1].trim());
          });
      }
      $(row)
        .find('td[colspan="2"] > div.pos > div.korcham_member > p:nth-child(2)')
        .each((_, cell) => {
          // 회비납부일
          const str = $(cell).text().trim();
          rowData.push(str && $(cell).text().split(":")[1].trim());
        });

      data.push(rowData);
    }
  });
}
function exportToExcel() {
  const workbook = xlsx.utils.book_new();
  const sheetName = "kocham";

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  const outputFilePath = "kocham2.xlsx";
  xlsx.writeFile(workbook, outputFilePath);
}

// 실행
start();
