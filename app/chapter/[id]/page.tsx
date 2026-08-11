import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter } from "@/lib/data";

export default async function ChapterPage({
  params,
}: PageProps<"/chapter/[id]">) {
  const { id } = await params;
  const chapterId = Number(id);
  const chapter = await getChapter(chapterId);
  if (!chapter) notFound();

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8 gap-6">
      <header className="space-y-2">
        <Link href="/" className="text-blue-600 text-sm">
          → كل الفصول
        </Link>
        <div className="text-xs text-slate-400">الفصل {chapter.id}</div>
        <h1 className="text-xl font-bold">{chapter.titleAr}</h1>
        <p className="text-slate-500 text-sm">اختر رقم السؤال الذي تريد حله</p>
      </header>

      <section className="grid grid-cols-4 gap-3">
        {chapter.questions.map((q) => (
          <Link
            key={q.number}
            href={`/chapter/${chapter.id}/question/${q.number}`}
            className="aspect-square rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-lg font-semibold active:scale-95 transition"
          >
            {q.number}
          </Link>
        ))}
      </section>
    </main>
  );
}
