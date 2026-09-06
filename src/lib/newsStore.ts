import fs from "fs";
import path from "path";
import { NewsArticle, DEFAULT_NEWS_ARTICLES } from "@/types/news";

export type { NewsArticle };
export { DEFAULT_NEWS_ARTICLES };

const NEWS_DB_PATH = path.join(process.cwd(), "src", "lib", "news_db.json");

let inMemoryNews: NewsArticle[] | null = null;

export function loadNewsFromDb(): NewsArticle[] {
  if (inMemoryNews) return inMemoryNews;

  try {
    if (fs.existsSync(NEWS_DB_PATH)) {
      const raw = fs.readFileSync(NEWS_DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryNews = parsed;
        return inMemoryNews!;
      }
    }
  } catch (err) {
    console.error("Failed to load news DB, using default seed:", err);
  }

  inMemoryNews = [...DEFAULT_NEWS_ARTICLES];
  saveNewsToDb(inMemoryNews);
  return inMemoryNews;
}

export function saveNewsToDb(articles: NewsArticle[]) {
  inMemoryNews = articles;
  try {
    const dir = path.dirname(NEWS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NEWS_DB_PATH, JSON.stringify(articles, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist news to disk:", err);
  }
}

export function getAllNews(): NewsArticle[] {
  return loadNewsFromDb();
}

export function getNewsById(id: string): NewsArticle | undefined {
  const all = getAllNews();
  return all.find(n => n.id === id);
}

export function createNews(data: Omit<NewsArticle, "id" | "created_at" | "updated_at">): NewsArticle {
  const all = getAllNews();
  const newArticle: NewsArticle = {
    ...data,
    id: `news-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const updated = [newArticle, ...all];
  saveNewsToDb(updated);
  return newArticle;
}

export function updateNews(id: string, updates: Partial<Omit<NewsArticle, "id" | "created_at">>): NewsArticle | null {
  const all = getAllNews();
  const index = all.findIndex(n => n.id === id);
  if (index === -1) return null;

  const updatedArticle: NewsArticle = {
    ...all[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  all[index] = updatedArticle;
  saveNewsToDb([...all]);
  return updatedArticle;
}

export function deleteNews(id: string): boolean {
  const all = getAllNews();
  const filtered = all.filter(n => n.id !== id);
  if (filtered.length === all.length) return false;

  saveNewsToDb(filtered);
  return true;
}

export function resetNewsToDefault(): NewsArticle[] {
  inMemoryNews = [...DEFAULT_NEWS_ARTICLES];
  saveNewsToDb(inMemoryNews);
  return inMemoryNews;
}
