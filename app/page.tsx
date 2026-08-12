import Link from "next/link";
import { getChapterSummaries } from "@/lib/data";

export default async function HomePage() {
  const chapters = await getChapterSummaries();

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8 gap-6">
      <header className="text-center space-y-2">
        <div className="text-4xl">📐</div>
        <h1 className="text-2xl font-bold">مساعد حل الفيزياء</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          اختر الفصل ورقم السؤال، وسنساعدك على فهم الحل خطوة بخطوة
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-500">الفصول</h2>
        {chapters.length === 0 && (
          <p className="text-slate-400 text-sm">لا توجد فصول متاحة بعد.</p>
        )}
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/chapter/${chapter.id}`}
            className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-4 active:scale-[0.98] transition"
          >
            <div>
              <div className="text-xs text-slate-400 mb-1">
                الفصل {chapter.id}
              </div>
              <div className="font-semibold">{chapter.titleAr}</div>
              <div className="text-xs text-slate-400 mt-1">
                {chapter.questionCount} أسئلة
              </div>
            </div>
            <span className="text-blue-600 text-xl">←</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
