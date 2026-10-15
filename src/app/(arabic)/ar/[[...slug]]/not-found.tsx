import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="page-intro">
      <div className="wrap">
        <p className="eyebrow">الصفحة غير موجودة</p>
        <h1>لنجد الصفحة المناسبة.</h1>
        <div className="actions">
          <Link className="button" href="/ar">
            الرئيسية ↗
          </Link>
        </div>
      </div>
    </section>
  )
}
