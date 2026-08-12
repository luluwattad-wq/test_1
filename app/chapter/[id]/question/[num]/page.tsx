import { notFound } from "next/navigation";
import { getQuestion } from "@/lib/data";
import TutorFlow from "./tutor-flow";

export default async function QuestionPage({
  params,
}: PageProps<"/chapter/[id]/question/[num]">) {
  const { id, num } = await params;
  const result = await getQuestion(Number(id), Number(num));
  if (!result) notFound();

  return (
    <TutorFlow
      chapterId={result.chapter.id}
      chapterTitle={result.chapter.titleAr}
      question={result.question}
    />
  );
}
