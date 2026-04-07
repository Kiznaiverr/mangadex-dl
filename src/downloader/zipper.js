import fs from "fs";
import path from "path";
import archiver from "archiver";
import logger from "../utils/logger.js";
import config from "../config.js";

class Zipper {
  /**
   * Create ZIP file from images
   */
  async createZip(images, outputFilename) {
    return new Promise((resolve, reject) => {
      const outputDir = config.get("outputDir");

      // Create output directory if doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const zipPath = path.join(outputDir, `${outputFilename}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Max compression
      });

      output.on("close", () => {
        const sizeKB = (archive.pointer() / 1024).toFixed(2);
        logger.success(`ZIP created: ${zipPath} (${sizeKB} KB)`);
        resolve(zipPath);
      });

      archive.on("error", (err) => {
        logger.error(`ZIP creation error: ${err.message}`);
        reject(err);
      });

      archive.pipe(output);

      // Add images to archive
      images.forEach((image) => {
        archive.append(image.data, { name: image.filename });
      });

      archive.finalize();
    });
  }
}

export default new Zipper();
