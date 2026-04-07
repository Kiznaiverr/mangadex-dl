import cliProgress from "cli-progress";
import mangadex from "../api/mangadex.js";
import logger from "../utils/logger.js";
import config from "../config.js";

class Downloader {
  /**
   * Download chapter images
   */
  async downloadChapter(chapterId, chapterTitle) {
    try {
      logger.info(`Fetching chapter images...`);
      const chapterData = await mangadex.getChapterImages(chapterId);
      const baseUrl = chapterData.baseUrl;
      const hash = chapterData.hash;
      const pages = chapterData.data;

      if (pages.length === 0) {
        throw new Error("No pages found in this chapter");
      }

      logger.success(`Found ${pages.length} pages`);

      // Create progress bar
      const progress = new cliProgress.SingleBar({
        format:
          "Download Progress |{bar}| {percentage}% || {value}/{total} pages",
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
      });

      progress.start(pages.length, 0);

      const images = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const imageUrl = `${baseUrl}/data/${hash}/${page}`;

        try {
          const imageData = await mangadex.downloadImage(imageUrl);
          images.push({
            data: imageData,
            filename: `${String(i + 1).padStart(3, "0")}.png`,
          });
          progress.increment();
        } catch (error) {
          progress.stop();
          logger.error(`Failed to download page ${i + 1}: ${error.message}`);
          throw error;
        }
      }

      progress.stop();
      logger.success(`Downloaded ${images.length} pages successfully`);

      return images;
    } catch (error) {
      logger.error(`Download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get safe filename from chapter title
   */
  getSafeFilename(chapterNumber, chapterTitle) {
    let filename = `ch${String(chapterNumber).padStart(3, "0")}`;

    if (chapterTitle && chapterTitle.trim()) {
      // Remove/replace invalid filename characters
      const safeName = chapterTitle
        .replace(/[<>:"/\\|?*]/g, "-")
        .replace(/\s+/g, "-")
        .substring(0, 50); // Limit length
      filename += `-${safeName}`;
    }

    return filename;
  }
}

export default new Downloader();
