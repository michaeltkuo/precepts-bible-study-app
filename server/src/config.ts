import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

type AppConfig = {
  port: number;
  youVersionApiKey: string;
  youVersionBaseUrl: string;
  defaultBibleId: number;
  ollamaBaseUrl: string;
  ollamaModel: string;
};

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 3001),
  youVersionApiKey: process.env.YOUVERSION_API_KEY ?? "",
  youVersionBaseUrl: process.env.YOUVERSION_BASE_URL ?? "https://api.youversion.com",
  defaultBibleId: Number(process.env.DEFAULT_BIBLE_ID ?? 2692),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "deepseek-r1:8b",
};
