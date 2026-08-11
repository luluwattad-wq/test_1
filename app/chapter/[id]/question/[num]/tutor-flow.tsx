"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { SolutionQuestion } from "@/lib/types";

interface FlatStep {
  partLabel: string | null;
  stepInPart: number;
  totalInPart: number;
  text: string;
}

function flattenSteps(question: SolutionQuestion): FlatStep[] {
  const flat: FlatStep[] = [];
  for (const part of question.parts) {
    part.steps.forEach((text, i) => {
      flat.push({
        partLabel: part.label,
        stepInPart: i + 1,
        totalInPart: part.steps.length,
        text,
      });
    });
  }
  return flat;
}

export default function TutorFlow({
  chapterId,
  chapterTitle,
  question,
}: {
  chapterId: number;
  chapterTitle: string;
  question: SolutionQuestion;
}) {
  const [stage, setStage] = useState<"capture" | "solving" | "done">(
    "capture"
  );
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = useMemo(() => flattenSteps(question), [question]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const current = steps[index];
  const isNewPart = current && (index === 0 || steps[index - 1].partLabel !== current.partLabel);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    setStage("solving");
  }

  function resetStepUI() {
    setRevealed(false);
    setAttempt("");
    setExplanation(null);
  }

  function goNext() {
    if (index + 1 >= steps.length) {
      setStage("done");
      return;
    }
    setIndex((i) => i + 1);
    resetStepUI();
  }

  async function askForHelp() {
    setExplainLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterTitle,
          questionNumber: question.number,
          partLabel: current.partLabel,
          stepText: current.text,
          studentAttempt: attempt,
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation as string);
    } catch {
      setExplanation("تعذّر الحصول على توضيح إضافي الآن. حاول مرة أخرى لاحقاً.");
    } finally {
      setExplainLoading(false);
    }
  }

  if (stage === "capture") {
    return (
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8 gap-6">
        <BackLink chapterId={chapterId} />
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-5xl">📷</div>
          <h1 className="text-xl font-bold">
            صوّر السؤال رقم {question.number}
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            التقط صورة للسؤال من الكتاب لتبقى أمامك أثناء الحل. هذه الخطوة
            اختيارية ويمكنك تخطيها.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 text-white rounded-2xl py-3.5 font-semibold shadow-sm active:scale-[0.98] transition"
          >
            التقط صورة
          </button>
          <button
            onClick={() => setStage("solving")}
            className="text-slate-500 text-sm underline underline-offset-4"
          >
            تخطي والانتقال للحل مباشرة
          </button>
        </div>
      </main>
    );
  }

  if (stage === "done") {
    return (
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-8 gap-6 items-center justify-center text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="text-xl font-bold">أحسنت! أنهيت حل السؤال {question.number}</h1>
        <p className="text-slate-500 text-sm">راجع الخطوات كل ما احتجت</p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <button
            onClick={() => {
              setIndex(0);
              resetStepUI();
              setStage("solving");
            }}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 font-semibold"
          >
            مراجعة الحل من جديد
          </button>
          <Link
            href={`/chapter/${chapterId}`}
            className="w-full bg-blue-600 text-white rounded-2xl py-3 font-semibold"
          >
            سؤال آخر من نفس الفصل
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-6 gap-4">
      <BackLink chapterId={chapterId} />

      <div className="flex items-center justify-between">
        <h1 className="font-bold">
          السؤال {question.number}
          {current.partLabel ? ` - ${current.partLabel}` : ""}
        </h1>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="صورة السؤال"
            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
          />
        )}
      </div>

      <ProgressBar current={index + 1} total={steps.length} />

      {isNewPart && current.partLabel && (
        <div className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 w-fit">
          الجزء {current.partLabel}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
        <div className="text-xs text-slate-400">
          الخطوة {current.stepInPart} من {current.totalInPart} في هذا الجزء
        </div>

        {!revealed ? (
          <>
            <p className="text-sm text-slate-600 leading-relaxed">
              قبل ما نعرض الحل، جرّب تكتب إجابتك أو تخمينك لهذه الخطوة (اختياري):
            </p>
            <textarea
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              placeholder="اكتب محاولتك هنا..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
            />
            <button
              onClick={() => setRevealed(true)}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold active:scale-[0.98] transition"
            >
              أظهر الخطوة الصحيحة
            </button>
          </>
        ) : (
          <>
            {attempt.trim() && (
              <div className="text-sm bg-slate-50 rounded-xl p-3">
                <span className="text-slate-400 text-xs block mb-1">محاولتك:</span>
                {attempt}
              </div>
            )}
            <div className="text-sm bg-emerald-50 border border-emerald-100 rounded-xl p-3 leading-relaxed">
              <span className="text-emerald-700 text-xs font-semibold block mb-1">
                الخطوة الصحيحة:
              </span>
              {current.text}
            </div>

            {explanation && (
              <div className="text-sm bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                <span className="text-amber-700 text-xs font-semibold block mb-1">
                  توضيح إضافي:
                </span>
                {explanation}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={goNext}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold active:scale-[0.98] transition"
              >
                فهمت، التالي ←
              </button>
              <button
                onClick={askForHelp}
                disabled={explainLoading}
                className="flex-1 bg-white border border-slate-200 rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {explainLoading ? "..." : "أحتاج توضيح أكثر"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function BackLink({ chapterId }: { chapterId: number }) {
  return (
    <Link href={`/chapter/${chapterId}`} className="text-blue-600 text-sm">
      → كل الأسئلة
    </Link>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
