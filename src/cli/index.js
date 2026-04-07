import inquirer from "inquirer";
import logger from "../utils/logger.js";
import config from "../config.js";
import mangadex from "../api/mangadex.js";

class CLIManager {
  /**
   * Main menu
   */
  async mainMenu() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "MangaDex Downloader",
        choices: [
          { name: "[>] Download Manga Chapter", value: "download" },
          { name: "[*] Settings", value: "settings" },
          { name: "[x] Exit", value: "exit" },
        ],
      },
    ]);
    return action;
  }

  /**
   * Search manga prompt
   */
  async searchManga() {
    const { query } = await inquirer.prompt([
      {
        type: "input",
        name: "query",
        message: "Enter manga title to search:",
        validate: (input) => {
          if (!input.trim()) {
            return "Please enter a manga title";
          }
          return true;
        },
      },
    ]);
    return query;
  }

  /**
   * Select manga from search results
   */
  async selectManga(mangas) {
    if (mangas.length === 0) {
      logger.warn("No manga found");
      return null;
    }

    const choices = mangas.map((manga, index) => ({
      name: `${mangadex.getTitle(manga)}`,
      value: manga.id,
      short: `#${index + 1}`,
    }));

    const { mangaId } = await inquirer.prompt([
      {
        type: "list",
        name: "mangaId",
        message: "Select manga:",
        choices,
      },
    ]);

    return mangaId;
  }

  /**
   * Display manga details
   */
  displayMangaDetails(manga) {
    const title = mangadex.getTitle(manga);
    const description =
      (manga.attributes.description?.en || "").substring(0, 200) + "..." ||
      "N/A";
    const status = manga.attributes.status || "N/A";
    const year = manga.attributes.year || "N/A";

    logger.section(`${title}`);
    console.log(`Status: ${status}`);
    console.log(`Year: ${year}`);
    console.log(`\nDescription:\n${description}\n`);
  }

  /**
   * Select chapter from list
   */
  async selectChapter(chapters) {
    if (chapters.length === 0) {
      logger.warn("No chapters found");
      return null;
    }

    const choices = chapters.map((chapter) => {
      const num = chapter.attributes.chapter || "N/A";
      const title = chapter.attributes.title || "No Title";
      const group = chapter.attributes.scanlation_group || "Unknown";
      return {
        name: `Chapter ${num}: ${title} (${group})`,
        value: chapter.id,
        short: `Ch ${num}`,
      };
    });

    const { chapterId } = await inquirer.prompt([
      {
        type: "list",
        name: "chapterId",
        message: "Select chapter to download:",
        choices,
        pageSize: 15,
      },
    ]);

    return chapterId;
  }

  /**
   * Confirm download
   */
  async confirmDownload(mangaTitle, chapterNumber, chapterTitle) {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Download "${mangaTitle}" Chapter ${chapterNumber}${chapterTitle ? ` - ${chapterTitle}` : ""}?`,
        default: true,
      },
    ]);
    return confirm;
  }

  /**
   * Settings menu
   */
  async settingsMenu() {
    const currentConfig = config.getAll();

    const { setting } = await inquirer.prompt([
      {
        type: "list",
        name: "setting",
        message: "Settings",
        choices: [
          {
            name: `[DIR] Output Directory: ${currentConfig.outputDir}`,
            value: "outputDir",
          },
          {
            name: `[RETRY] Retry Attempts: ${currentConfig.retryAttempts}`,
            value: "retry",
          },
          {
            name: `[DELAY] Rate Limit Delay (ms): ${currentConfig.rateLimitDelay}`,
            value: "rateLimitDelay",
          },
          { name: "[BACK] Back", value: "back" },
        ],
      },
    ]);

    return setting;
  }

  /**
   * Edit output directory
   */
  async editOutputDir(current) {
    const { dir } = await inquirer.prompt([
      {
        type: "input",
        name: "dir",
        message: "Enter output directory path:",
        default: current,
        validate: (input) => {
          if (!input.trim()) {
            return "Directory path cannot be empty";
          }
          return true;
        },
      },
    ]);
    return dir;
  }

  /**
   * Edit retry attempts
   */
  async editRetryAttempts(current) {
    const { attempts } = await inquirer.prompt([
      {
        type: "number",
        name: "attempts",
        message: "Enter retry attempts:",
        default: current,
        validate: (input) => {
          if (input < 1 || input > 10) {
            return "Please enter a number between 1 and 10";
          }
          return true;
        },
      },
    ]);
    return attempts;
  }

  /**
   * Edit rate limit delay
   */
  async editRateLimitDelay(current) {
    const { delay } = await inquirer.prompt([
      {
        type: "number",
        name: "delay",
        message: "Enter rate limit delay in milliseconds:",
        default: current,
        validate: (input) => {
          if (input < 100 || input > 5000) {
            return "Please enter a number between 100 and 5000";
          }
          return true;
        },
      },
    ]);
    return delay;
  }

  /**
   * Display current settings
   */
  displaySettings() {
    const cfg = config.getAll();
    logger.section("⚙️  Current Settings");
    console.log(`Output Directory: ${cfg.outputDir}`);
    console.log(`Language: ${cfg.language}`);
    console.log(`Retry Attempts: ${cfg.retryAttempts}`);
    console.log(`Retry Delay: ${cfg.retryDelay}ms`);
    console.log(`Rate Limit Delay: ${cfg.rateLimitDelay}ms`);
    console.log();
  }
}

export default new CLIManager();
