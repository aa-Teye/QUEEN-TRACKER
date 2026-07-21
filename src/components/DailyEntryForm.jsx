import { useState } from 'react'
import { submitDaily } from '../lib/api'
import { todayISO } from '../lib/format'

export default function DailyEntryForm({ existing, onSuccess }) {
  const [date, setDate] = useState(existing?.date || todayISO())
  const [cash, setCash] = useState(existing?.cash_collected || '')
  const [vis, setVis] = useState(existing?.visitations || '')
  const [acc, setAcc] = useState(existing?.accounts_opened || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    try {
      const res = await submitDaily({
        date,
        cash_collected: Number(cash) || 0,
        visitations: Number(vis) || 0,
        accounts_opened: Number(acc) || 0,
        notes,
      })
      if (res.success) {
        setFeedback({ ok: true, msg: 'Entry saved successfully.' })
        setTimeout(() => onSuccess && onSuccess(), 800)
      } else {
        setFeedback({ ok: false, msg: res.error || 'Submission failed.' })
      }
    } catch (err) {
      setFeedback({ ok: false, msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <label style={styles.label}>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Cash Collected (GHS)</label>
        <input
          type="number"
          placeholder="0"
          value={cash}
          onChange={e => setCash(e.target.value)}
          inputMode="numeric"
          style={styles.input}
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Visitations</label>
        <input
          type="number"
          placeholder="0"
          value={vis}
          onChange={e => setVis(e.target.value)}
          inputMode="numeric"
          style={styles.input}
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Accounts Opened</label>
        <input
          type="number"
          placeholder="0"
          value={acc}
          onChange={e => setAcc(e.target.value)}
          inputMode="numeric"
          style={styles.input}
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>Notes (optional)</label>
        <textarea
          placeholder="Any notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          style={{ ...styles.input, resize: 'none' }}
        />
      </div>

      {feedback && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          background: feedback.ok ? 'rgba(67,233,123,0.1)' : 'rgba(255,95,109,0.1)',
          color: feedback.ok ? '#43e97b' : '#ff5f6d',
          border: `1px solid ${feedback.ok ? 'rgba(67,233,123,0.3)' : 'rgba(255,95,109,0.3)'}`,
        }}>
          {feedback.msg}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        ...styles.btn,
        opacity: loading ? 0.6 : 1,
      }}>
        {loading ? 'Saving...' : existing ? 'Update Entry' : 'Submit Entry'}
      </button>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    padding: '12px 14px',
    outline: 'none',
    width: '100%',
    colorScheme: 'dark',
  },
  btn: {
    background: '#F5C842',
    color: '#1a0f3c',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    cursor: 'pointer',
    width: '100%',
    marginTop: 4,
  },
}
