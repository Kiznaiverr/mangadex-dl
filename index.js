import chalk from "chalk";
import ora from "ora";
import cli from "./src/cli/index.js";
import mangadex from "./src/api/mangadex.js";
import downloader from "./src/downloader/downloader.js";
import zipper from "./src/downloader/zipper.js";
import logger from "./src/utils/logger.js";
import config from "./src/config.js";

async function handleDownload() {
  try {
    // Search manga
    const query = await cli.searchManga();
    let spinner = ora("Searching manga...").start();

    try {
      const mangas = await mangadex.searchManga(query);
      spinner.succeed(`Found ${mangas.length} results`);

      const mangaId = await cli.selectManga(mangas);
      if (!mangaId) return;

      // Get manga details
      spinner = ora("Loading manga details...").start();
      const mangaDetail = await mangadex.getMangaDetail(mangaId);
      spinner.succeed("Manga loaded");

      cli.displayMangaDetails(mangaDetail);

      // Get chapters
      spinner = ora("Fetching chapters...").start();
      const { data: chapters } = await mangadex.getChapters(mangaId);
      spinner.succeed(`Found ${chapters.length} chapters`);

      // Filter chapters with proper data
      const validChapters = chapters.filter(
        (ch) => ch.attributes && ch.attributes.chapter,
      );

      if (validChapters.length === 0) {
        logger.warn("No valid chapters found");
        return;
      }

      // Sort by chapter number descending (newest first)
      validChapters.sort(
        (a, b) =>
          parseFloat(b.attributes.chapter || 0) -
          parseFloat(a.attributes.chapter || 0),
      );

      // Select chapter
      const chapterId = await cli.selectChapter(validChapters);
      if (!chapterId) return;

      const selectedChapter = validChapters.find((ch) => ch.id === chapterId);
      const chapterNumber = selectedChapter.attributes.chapter;
      const chapterTitle = selectedChapter.attributes.title;
      const mangaTitle = mangadex.getTitle(mangaDetail);
      const scanlationGroup = mangadex.getScanlationGroup(selectedChapter);

      // Confirm download
      const proceed = await cli.confirmDownload(
        mangaTitle,
        chapterNumber,
        chapterTitle,
      );
      if (!proceed) return;

      // Display scanlation group info
      logger.info(`Scanlation Group: ${scanlationGroup}`);

      // Download chapter images
      const images = await downloader.downloadChapter(chapterId, chapterTitle);

      // Create ZIP file
      const filename = downloader.getSafeFilename(
        Math.floor(parseFloat(chapterNumber)),
        chapterTitle,
      );

      spinner = ora("Creating ZIP file...").start();
      const zipPath = await zipper.createZip(images, filename);
      spinner.succeed("ZIP created successfully");

      logger.section("Download Complete!");
      console.log(`[OUTPUT] Path: ${zipPath}`);
      console.log(`[COUNT] Images: ${images.length}`);
      console.log(`[GROUP] Scanlation: ${scanlationGroup}\n`);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Download failed: ${error.message}`);
  }
}

async function handleSettings() {
  let inSettings = true;

  while (inSettings) {
    try {
      const setting = await cli.settingsMenu();

      if (setting === "back") {
        inSettings = false;
      } else if (setting === "outputDir") {
        const newDir = await cli.editOutputDir(config.get("outputDir"));
        config.set("outputDir", newDir);
        logger.success(`Output directory updated to: ${newDir}`);
      } else if (setting === "retry") {
        const attempts = await cli.editRetryAttempts(
          config.get("retryAttempts"),
        );
        config.set("retryAttempts", attempts);
        logger.success(`Retry attempts updated to: ${attempts}`);
      } else if (setting === "rateLimitDelay") {
        const delay = await cli.editRateLimitDelay(
          config.get("rateLimitDelay"),
        );
        config.set("rateLimitDelay", delay);
        logger.success(`Rate limit delay updated to: ${delay}ms`);
      }
    } catch (error) {
      logger.error(`Settings error: ${error.message}`);
    }
  }
}

async function main() {
  console.clear();
  console.log(chalk.cyan.bold("╔════════════════════════════════════╗"));
  console.log(chalk.cyan.bold("║   MangaDex CLI Downloader v1.0.0   ║"));
  console.log(chalk.cyan.bold("║  Credit: MangaDex & Scanlation Grp ║"));
  console.log(chalk.cyan.bold("╚════════════════════════════════════╝\n"));

  let running = true;

  while (running) {
    try {
      const action = await cli.mainMenu();

      if (action === "download") {
        await handleDownload();
      } else if (action === "settings") {
        await handleSettings();
      } else if (action === "exit") {
        running = false;
        logger.success("Goodbye!");
      }
    } catch (error) {
      if (error.isTtyError) {
        logger.error("Prompt could not be rendered");
      } else {
        logger.error(`Unexpected error: ${error.message}`);
      }
      running = false;
    }
  }
}

main();
