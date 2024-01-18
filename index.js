const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

// 수정 부분
const START_ID = 1; // 시작 id
const END_ID = 1; // 종료 id
const interval = 1000; // 조회 주기 (ms 단위)

const BASE_URL = "http://www.kocham.kr/theme/inet/sub/detail.php?wr_id=";

function start() {
  for (let i = START_ID; i <= END_ID; i++) {
    getTableElementById(i);
  }
}
async function getTableElementById(id) {
  // node 환경에서 브라우저 접속
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // target 페이지 접속
  await page.goto(BASE_URL + id);

  // document (전체 페이지)
  const content = await page.content();
  const $ = cheerio.load(content);
  const table = $(".subtable_list");
  table.each((index, el) => {
    console.log();
  });

  await browser.close();
}
function exportToExcel() {
  const htmlTableString = `
    <table>
       <thead>
          <tr>
             <th>Name</th>
             <th>Age</th>
             <th>Country</th>
          </tr>
       </thead>
       <tbody>
          <tr>
             <td>John Doe</td>
             <td>25</td>
             <td>USA</td>
          </tr>
          <tr>
             <td>Jane Doe</td>
             <td>30</td>
             <td>Canada</td>
          </tr>
       </tbody>
    </table>
 `;

  const $ = cheerio.load(htmlTableString);

  const data = [];
  $("table tbody tr").each((index, row) => {
    const rowData = [];
    $(row)
      .find("td")
      .each((i, cell) => {
        rowData.push($(cell).text());
      });
    data.push(rowData);
  });
  console.log(data);

  const workbook = xlsx.utils.book_new();
  const sheetName = 'kocham';

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  const outputFilePath = 'kocham.xlsx';
  xlsx.writeFile(workbook, outputFilePath);
}

// 실행
exportToExcel();
