import Link from 'next/link'

/** Same content as the original 404.html. */
export default function NotFound() {
  return (
    <>
      <section className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Page not found</p>
          <h1>Let’s find the right page.</h1>
          <p className="lede">The address may have changed. Explore our solutions or return to the homepage.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap actions">
          <Link className="button" href="/">
            Return home ↗
          </Link>
          <Link className="button secondary" href="/services">
            Browse solutions ↗
          </Link>
          <Link className="text-link" href="/contact">
            Discuss your campaign ↗
          </Link>
        </div>
      </section>
    </>
  )
}
