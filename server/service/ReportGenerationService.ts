import fs from "fs";
import https from "https";
import StreamZip from "node-stream-zip";
import path from "path";
import PDFDocumentWithTables from "pdfkit-table";

import { Report, ReportRepository } from "../constant/types";

export class ReportGenerationService {
  private readonly WORK_FOLDER = "../temp";

  constructor() {
    if (!fs.existsSync(this.WORK_FOLDER)) {
      fs.mkdirSync(this.WORK_FOLDER);
    }
  }

  async generateReportPdfFile(
    report: Report
  ): Promise<{ pdfBlob: Buffer; filename: string }> {
    const downloadUrl = this.getDownloadUrl(report);
    const filename = this.getFilename(report);

    this.cleanWorkFolder();
    await this.downloadZipFile(downloadUrl, filename);
    await this.unzipFileToCsvFile(filename);
    const rows = this.readCsvFile(filename);
    const pdfBlob = await this.generatePdfFile(filename, rows);

    return { pdfBlob, filename };
  }

  private getDownloadUrl(report: Report) {
    const { frequency, ticker } = report;
    return `https://data.binance.vision/data/spot/daily/klines/${ticker}/${frequency}/${this.getFilename(
      report
    )}.zip`;
  }

  private getFilename(report: Report) {
    const { date, frequency, ticker } = report;
    return `${ticker}-${frequency}-${date}`;
  }

  private cleanWorkFolder() {
    const files = fs.readdirSync(this.WORK_FOLDER);
    for (const file of files) {
      fs.unlinkSync(path.join(this.WORK_FOLDER, file));
    }
  }

  private async downloadZipFile(downloadUrl: string, filename: string) {
    const pathname = path.resolve(this.WORK_FOLDER, `${filename}.zip`);
    const file = fs.createWriteStream(pathname);

    return new Promise((resolve, reject) => {
      const request = https.get(downloadUrl, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(undefined);
        });
      });

      request.on("error", (err) => {
        file.close();
        reject(err);
      });
    });
  }

  private async unzipFileToCsvFile(filename: string) {
    const pathname = path.resolve(this.WORK_FOLDER, `${filename}.zip`);

    return new Promise((resolve, reject) => {
      const zip = new StreamZip({
        file: pathname,
        storeEntries: true,
      });

      zip.on("error", (err) => {
        reject(err);
      });

      zip.on("entry", (entry) => {
        var pathname = path.resolve(this.WORK_FOLDER, entry.name);
        if (/\.\./.test(path.relative(this.WORK_FOLDER, pathname))) {
          return;
        }

        if ("/" === entry.name[entry.name.length - 1]) {
          return;
        }

        zip.stream(entry.name, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          if (!stream) {
            reject("Failed to create zip stream");
            return;
          }

          stream.on("error", (err) => {
            reject(err);
          });

          stream.on("end", () => {
            zip.close();
            resolve(undefined);
          });

          stream.pipe(fs.createWriteStream(pathname));
        });
      });
    });
  }

  private readCsvFile(filename: string) {
    const pathname = path.resolve(this.WORK_FOLDER, `${filename}.csv`);
    const content = fs.readFileSync(pathname, "utf8");
    const rows = content.split("\n").slice(0, 1000);
    return rows.map((row) => row.split(","));
  }

  private async generatePdfFile(
    filename: string,
    rows: string[][]
  ): Promise<Buffer> {
    let doc = new PDFDocumentWithTables({ margin: 30, size: "A4" });

    const pathname = path.resolve(this.WORK_FOLDER, `${filename}.pdf`);
    const writeStream = fs.createWriteStream(pathname);
    doc.pipe(writeStream);

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

    return new Promise((resolve) => {
      writeStream.on("finish", () => {
        const blob = fs.readFileSync(pathname);
        resolve(blob);
      });
    });
  }
}
