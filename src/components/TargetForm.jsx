import { useState } from 'react'
import { submitConfig } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/format'

export default function TargetForm({ existing, month, onSuccess, onClose }) {
  const [targetMonth, setTargetMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [cashTarget, setCashTarget] = useState(existing?.cash_target || '')
  const [visTarget, setVisTarget] = useState(existing?.visitation_target || '')
  const [accTarget, setAccTarget] = useState(existing?.account_target || '')
  const [workingDays, setWorkingDays] = useState(existing?.working_days || '20')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const numCash = Number(cashTarget) || 0
  const numDays = Number(workingDays) || 20
  const calculatedDaily = numCash > 0 && numDays > 0 ? Math.round(numCash / numDays) : 0
  const calculatedQuarter = numCash * 3

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    try {
      const res = await submitConfig({
        month: targetMonth,
        cash_target: numCash,
        visitation_target: Number(visTarget) || 0,
        account_target: Number(accTarget) || 0,
        daily_cash_target: calculatedDaily,
        working_days: numDays,
        currency: 'GHS',
      })
      if (res.success) {
        setFeedback({ ok: true, msg: 'Targets saved successfully!' })
        setTimeout(() => onSuccess && onSuccess(), 800)
      } else {
        setFeedback({ ok: false, msg: res.error || 'Failed to save targets.' })
      }
    } catch (err) {
      setFeedback({ ok: false, msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Set & Edit Targets</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Configure targets for {targetMonth}
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>Target Month</label>
            <input
              type="month"
              value={targetMonth}
              onChange={e => setTargetMonth(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Monthly Cash Target (GHS)</label>
            <input
              type="number"
              placeholder="e.g. 860000"
              value={cashTarget}
              onChange={e => setCashTarget(e.target.value)}
              inputMode="numeric"
              style={styles.input}
            />
          </div>

          {numCash > 0 && (
            <div style={styles.quarterBadge}>
              <div style={{ fontSize: 11, color: 'rgba(245,200,66,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quarterly Target Projection (3 Months)
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#F5C842', marginTop: 4 }}>
                {formatCurrency(calculatedQuarter)}
              </div>
            </div>
          )}

          <div style={styles.grid2}>
            <div style={styles.row}>
              <label style={styles.label}>Visitations Target</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={visTarget}
                onChange={e => setVisTarget(e.target.value)}
                inputMode="numeric"
                style={styles.input}
              />
            </div>
            <div style={styles.row}>
              <label style={styles.label}>Accounts Target</label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={accTarget}
                onChange={e => setAccTarget(e.target.value)}
                inputMode="numeric"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.row}>
              <label style={styles.label}>Working Days</label>
              <input
                type="number"
                placeholder="20"
                value={workingDays}
                onChange={e => setWorkingDays(e.target.value)}
                inputMode="numeric"
                style={styles.input}
              />
            </div>
            <div style={styles.row}>
              <label style={styles.label}>Daily Cash Target (Auto)</label>
              <div style={{
                ...styles.input,
                background: 'rgba(255,255,255,0.03)',
                color: '#F5C842',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}>
                {formatCurrency(calculatedDaily)}
              </div>
            </div>
          </div>

          {feedback && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: feedback.ok ? 'rgba(67,233,123,0.1)' : 'rgba(255,95,109,0.1)',
              color: feedback.ok ? '#43e97b' : '#ff5f6d',
              border: `1px solid ${feedback.ok ? 'rgba(67,233,123,0.3)' : 'rgba(255,95,109,0.3)'}`,
            }}>
              {feedback.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Saving...' : 'Save Targets'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(10, 5, 25, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: 'linear-gradient(160deg, #1a0f3c 0%, #2D1B69 100%)',
    border: '1px solid rgba(245,200,66,0.3)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#fff',
    fontSize: 16,
    width: 32,
    height: 32,
    borderRadius: '50%',
    cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  label: {
    fontSize: 11,
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
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    padding: '11px 12px',
    outline: 'none',
    width: '100%',
    colorScheme: 'dark',
  },
  quarterBadge: {
    background: 'rgba(245,200,66,0.08)',
    border: '1px solid rgba(245,200,66,0.25)',
    borderRadius: 12,
    padding: '12px 14px',
  },
  cancelBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    padding: 12,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  submitBtn: {
    flex: 1,
    background: '#F5C842',
    border: 'none',
    color: '#1a0f3c',
    fontWeight: 700,
    fontSize: 14,
    padding: 12,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
}
