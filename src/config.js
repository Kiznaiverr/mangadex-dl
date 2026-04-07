import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "config.json");

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading config:", error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      outputDir: "./downloads",
      language: "en",
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimitDelay: 200,
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error("Error saving config:", error.message);
      return false;
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    return this.saveConfig();
  }

  getAll() {
    return { ...this.config };
  }

  updateMultiple(updates) {
    Object.assign(this.config, updates);
    return this.saveConfig();
  }
}

export default new ConfigManager();
