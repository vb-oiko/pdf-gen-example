const http = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const path = require("path");
const StreamZip = require("node-stream-zip");
const PDFDocument = require("pdfkit-table");

const ticker = "1INCHBTC-1s-2022-12-22";

const WORK_FOLDER = "./temp";

async function downloadZipFile(filename) {
  const url = `https://data.binance.vision/data/spot/daily/klines/1INCHBTC/1s/${filename}.zip`;

  const pathname = path.resolve(WORK_FOLDER, `${filename}.zip`);
  const file = fs.createWriteStream(pathname);

  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      reject(err);
    });
  });
}

async function unzipFileToCsvFile(filename) {
  const pathname = path.resolve(WORK_FOLDER, `${filename}.zip`);

  return new Promise((resolve, reject) => {
    const zip = new StreamZip({
      file: pathname,
      storeEntries: true,
    });

    zip.on("error", (err) => {
      reject(err);
    });

    zip.on("entry", (entry) => {
      var pathname = path.resolve(WORK_FOLDER, entry.name);
      if (/\.\./.test(path.relative(WORK_FOLDER, pathname))) {
        return;
      }

      if ("/" === entry.name[entry.name.length - 1]) {
        return;
      }

      zip.stream(entry.name, (err, stream) => {
        if (err) {
          reject(err);
        }

        stream.on("error", (err) => {
          reject(err);
        });

        stream.on("end", () => {
          zip.close();
          resolve();
        });

        stream.pipe(fs.createWriteStream(pathname));
      });
    });
  });
}

async function cleanTempFolder() {
  const files = fs.readdirSync(WORK_FOLDER);
  for (const file of files) {
    fs.unlinkSync(path.join(WORK_FOLDER, file));
  }
}

function readCsvFile(filename) {
  const pathname = path.resolve(WORK_FOLDER, `${filename}.csv`);
  const content = fs.readFileSync(pathname, "utf8");
  // TODO remove ows limit
  const rows = content.split("\n").slice(0, 1000);
  return rows.map((row) => row.split(","));
}

async function genPdf(filename) {
  const rows = readCsvFile(filename);

  let doc = new PDFDocument({ margin: 30, size: "A4" });
  const pathname = path.resolve(WORK_FOLDER, `${filename}.pdf`);
  doc.pipe(fs.createWriteStream(pathname));

  const table = {
    title: filename,
    headers: [
      "Open time",
      "Open",
      "High",
      "Low",
      "Close",
      "Volume",
      "Close time",
      "Quote asset volume",
      "Number of trades",
      "Taker buy base asset volume",
      "Taker buy quote asset volume",
      "Ignore",
    ],
    rows,
  };

  await doc.table(table, {});
  doc.end();
}

async function processJob(ticker) {
  cleanTempFolder();
  await downloadZipFile(ticker);
  await unzipFileToCsvFile(ticker);
  await genPdf(ticker);
  console.warn("Completed!");
}

processJob(ticker);

module.exports = {
  processJob,
};
