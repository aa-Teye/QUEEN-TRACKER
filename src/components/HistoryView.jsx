import { useState, useEffect } from 'react'
import { getHistory } from '../lib/api'
import { formatCurrency, formatDate, formatNumber } from '../lib/format'

export default function HistoryView({ cashTarget }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHistory(30)
      .then(data => {
        // sort descending (most recent first)
        setEntries(Array.isArray(data) ? [...data].reverse() : [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.dim}>Loading history...</p>
  if (error) return <p style={styles.error}>{error}</p>
  if (!entries.length) return <p style={styles.dim}>No entries recorded yet.</p>

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((row, i) => {
        const dailyTarget = cashTarget ? Math.round(cashTarget / 20) : 0
        const hit = dailyTarget ? row.cash_collected >= dailyTarget : true
        return (
          <div key={i} style={styles.row}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={styles.date}>{formatDate(row.date)}</span>
              <span style={{ ...styles.cash, color: hit ? 'var(--success)' : 'var(--error)' }}>
                {formatCurrency(row.cash_collected)}
              </span>
            </div>
            <div style={styles.meta}>
              {formatNumber(row.visitations)} visits &nbsp;&middot;&nbsp; {formatNumber(row.accounts_opened)} accounts
              {row.notes ? ` · ${row.notes}` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  dim: { fontSize: 13, color: 'var(--rose-pastel)', marginTop: 12, fontWeight: 500 },
  error: { fontSize: 13, color: 'var(--error)', marginTop: 12, fontWeight: 700 },
  row: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
  },
  date: { fontSize: 13, fontWeight: 700, color: 'var(--rose-pale)' },
  cash: { fontSize: 14, fontWeight: 700 },
  meta: { fontSize: 11, color: 'var(--rose-pastel)', marginTop: 4, fontWeight: 500 },
}
