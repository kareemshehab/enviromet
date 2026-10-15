import React from 'react'
import type { Payload } from 'payload'
import { findSharedSectionUsage } from '@/lib/sharedSectionUsage'

/**
 * Shared section editor (ui field): lists where this section is placed,
 * so editors know which pages a change affects.
 */
export async function SharedSectionUsage({ payload, id }: { payload: Payload; id?: number | string }) {
  if (!id)
    return <p className="em-usage">Save the section, then add it to pages with the “Shared section” block.</p>
  const uses = await findSharedSectionUsage(payload, id)
  return (
    <div className="em-usage">
      <p className="em-usage__title">
        {uses.length ? `Used on ${uses.length} ${uses.length === 1 ? 'page' : 'pages'}` : 'Not used on any page yet'}
      </p>
      {uses.length > 0 && (
        <ul>
          {uses.map((u) => (
            <li key={u.href}>
              <a href={u.href}>{u.label}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
