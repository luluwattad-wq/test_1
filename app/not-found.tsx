import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="text-5xl">🔍</div>
      <h1 className="text-xl font-bold">لم نجد هذه الصفحة</h1>
      <p className="text-slate-500 text-sm">تأكد من الفصل أو رقم السؤال</p>
      <Link href="/" className="text-blue-600 font-semibold">
        العودة للصفحة الرئيسية
      </Link>
    </main>
  );
}
