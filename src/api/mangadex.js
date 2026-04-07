import { retryWithBackoff, delay } from "../utils/retry.js";
import config from "../config.js";

const API_BASE = "https://api.mangadex.org";

class MangaDexAPI {
  /**
   * Build query string from params object
   */
  buildQueryString(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(`${key}[]`, v));
      } else {
        query.set(key, value);
      }
    });
    return query.toString();
  }

  /**
   * Search manga by title
   */
  async searchManga(title, limit = 10) {
    return retryWithBackoff(
      async () => {
        const params = this.buildQueryString({
          title,
          limit,
          includes: ["cover_art", "author", "artist"],
        });
        const response = await fetch(`${API_BASE}/manga?${params}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        await delay(config.get("rateLimitDelay"));
        return data.data;
      },
      config.get("retryAttempts"),
      config.get("retryDelay"),
    );
  }

  /**
   * Get manga details including relationships
   */
  async getMangaDetail(mangaId) {
    return retryWithBackoff(
      async () => {
        const params = this.buildQueryString({
          includes: ["cover_art", "author", "artist"],
        });
        const response = await fetch(`${API_BASE}/manga/${mangaId}?${params}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        await delay(config.get("rateLimitDelay"));
        return data.data;
      },
      config.get("retryAttempts"),
      config.get("retryDelay"),
    );
  }

  /**
   * Get chapter list for manga
   */
  async getChapters(mangaId, limit = 100, offset = 0) {
    return retryWithBackoff(
      async () => {
        const params = this.buildQueryString({
          limit,
          offset,
          translatedLanguage: [config.get("language")],
          includes: ["scanlation_group"],
          "order[chapter]": "desc",
        });
        const response = await fetch(
          `${API_BASE}/manga/${mangaId}/feed?${params}`,
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        await delay(config.get("rateLimitDelay"));
        return {
          data: data.data,
          total: data.total,
        };
      },
      config.get("retryAttempts"),
      config.get("retryDelay"),
    );
  }

  /**
   * Get chapter images (at-home server)
   */
  async getChapterImages(chapterId) {
    return retryWithBackoff(
      async () => {
        const response = await fetch(`${API_BASE}/at-home/server/${chapterId}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        await delay(config.get("rateLimitDelay"));
        return {
          baseUrl: data.baseUrl,
          hash: data.chapter.hash,
          data: data.chapter.data,
        };
      },
      config.get("retryAttempts"),
      config.get("retryDelay"),
    );
  }

  /**
   * Download single image from chapter
   */
  async downloadImage(url) {
    return retryWithBackoff(
      async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Image error: ${response.status}`);
        const buffer = await response.arrayBuffer();
        await delay(config.get("rateLimitDelay"));
        return Buffer.from(buffer);
      },
      config.get("retryAttempts"),
      config.get("retryDelay"),
    );
  }

  /**
   * Get relationship object from includes
   */
  getRelationship(data, type) {
    if (!data.relationships) return null;
    const rel = data.relationships.find((r) => r.type === type);
    return rel?.id || null;
  }

  /**
   * Get scanlation group name from chapter
   */
  getScanlationGroup(chapter) {
    if (!chapter.relationships) return "Unknown";
    const group = chapter.relationships.find(
      (r) => r.type === "scanlation_group",
    );
    return group?.attributes?.name || "Unknown";
  }

  /**
   * Extract manga title safely
   */
  getTitle(manga) {
    const title = manga.attributes?.title;
    if (typeof title === "string") {
      return title;
    }
    if (typeof title === "object") {
      return title.en || Object.values(title)[0] || "N/A";
    }
    return "N/A";
  }
}

export default new MangaDexAPI();
