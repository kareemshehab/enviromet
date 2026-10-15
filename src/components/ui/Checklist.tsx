import React from 'react'

/** Bulleted check list with an optional bold lead-in per item. */
export const Checklist = ({ items }: { items?: { lead?: string | null; text: string }[] | null }) =>
  items?.length ? (
    <ul className="check-list">
      {items.map((it, i) => (
        <li key={i}>
          {it.lead && (
            <>
              <strong>{it.lead}</strong>{' '}
            </>
          )}
          {it.text}
        </li>
      ))}
    </ul>
  ) : null
