import "server-only";
import fs from "fs/promises";
import path from "path";
import type { Chapter, ChapterSummary, SolutionQuestion } from "./types";

const CHAPTERS_DIR = path.join(process.cwd(), "data", "chapters");

export async function getChapterSummaries(): Promise<ChapterSummary[]> {
  const raw = await fs.readFile(path.join(CHAPTERS_DIR, "index.json"), "utf-8");
  return JSON.parse(raw);
}

export async function getChapter(id: number): Promise<Chapter | null> {
  try {
    const raw = await fs.readFile(path.join(CHAPTERS_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getQuestion(
  chapterId: number,
  questionNumber: number
): Promise<{ chapter: Chapter; question: SolutionQuestion } | null> {
  const chapter = await getChapter(chapterId);
  if (!chapter) return null;
  const question = chapter.questions.find((q) => q.number === questionNumber);
  if (!question) return null;
  return { chapter, question };
}
