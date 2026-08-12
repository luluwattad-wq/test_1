export interface SolutionPart {
  label: string | null;
  steps: string[];
}

export interface SolutionQuestion {
  number: number;
  parts: SolutionPart[];
}

export interface Chapter {
  id: number;
  titleAr: string;
  subjectAr: string;
  sourceNote?: string;
  questions: SolutionQuestion[];
}

export interface ChapterSummary {
  id: number;
  titleAr: string;
  questionCount: number;
}
