import { NextRequest, NextResponse } from "next/server";

interface ExplainRequest {
  chapterTitle: string;
  questionNumber: number;
  partLabel: string | null;
  stepText: string;
  studentAttempt?: string;
}

const FALLBACK_MESSAGE =
  "لا يتوفر حالياً مساعد ذكاء اصطناعي لشرح إضافي (لم يتم إعداد مفتاح API). حاول تقسيم الخطوة إلى مفاهيمها الأساسية، أو اسأل معلمك عن الجزء غير الواضح.";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ExplainRequest;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ explanation: FALLBACK_MESSAGE });
  }

  const attemptLine = body.studentAttempt?.trim()
    ? `محاولة الطالب: "${body.studentAttempt.trim()}"`
    : "الطالب لم يكتب محاولة.";

  const prompt = `أنت معلّم فيزياء يشرح بالعربية لطالب مدرسة ثانوية.
الفصل: ${body.chapterTitle}
السؤال رقم: ${body.questionNumber}${body.partLabel ? ` (الجزء ${body.partLabel})` : ""}
الخطوة الصحيحة من كتاب الحل: "${body.stepText}"
${attemptLine}

اشرح هذه الخطوة بطريقة أبسط وأوضح، بأسلوب تدريجي ومشجّع، بجملتين إلى ثلاث جمل فقط، بدون إعادة كتابة نص الخطوة حرفياً. لا تحل خطوات أخرى غير هذه.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ explanation: FALLBACK_MESSAGE });
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim() || FALLBACK_MESSAGE;
    return NextResponse.json({ explanation: text });
  } catch {
    return NextResponse.json({ explanation: FALLBACK_MESSAGE });
  }
}
