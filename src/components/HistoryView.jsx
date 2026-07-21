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
              <span style={{ ...styles.cash, color: hit ? '#43e97b' : '#ff5f6d' }}>
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
  dim: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 12 },
  error: { fontSize: 13, color: '#ff5f6d', marginTop: 12 },
  row: {
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  date: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  cash: { fontSize: 14, fontWeight: 700 },
  meta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
}
