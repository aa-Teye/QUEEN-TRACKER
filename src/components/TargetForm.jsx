import { useState } from 'react'
import { submitConfig } from '../lib/api'
import { formatCurrency, formatNumber } from '../lib/format'

export default function TargetForm({ existing, month, onSuccess, onClose }) {
  const [level, setLevel] = useState('monthly') // 'monthly' | 'quarterly' | 'yearly'
  
  // Monthly States
  const [targetMonth, setTargetMonth] = useState(month || new Date().toISOString().slice(0, 7))
  const [cashTarget, setCashTarget] = useState(existing?.cash_target || '')
  const [visTarget, setVisTarget] = useState(existing?.visitation_target || '')
  const [accTarget, setAccTarget] = useState(existing?.account_target || '')
  const [workingDays, setWorkingDays] = useState(existing?.working_days || '20')

  // Quarterly States
  const [targetQuarter, setTargetQuarter] = useState('Q3')
  const [quarterYear, setQuarterYear] = useState('2026')
  const [qCash, setQCash] = useState(existing?.cash_target ? existing.cash_target * 3 : '')
  const [qVis, setQVis] = useState(existing?.visitation_target ? existing.visitation_target * 3 : '')
  const [qAcc, setQAcc] = useState(existing?.account_target ? existing.account_target * 3 : '')
  const [qDays, setQDays] = useState(existing?.working_days ? existing.working_days * 3 : '60')

  // Yearly States
  const [targetYear, setTargetYear] = useState('2026')
  const [yCash, setYCash] = useState(existing?.cash_target ? existing.cash_target * 12 : '')
  const [yVis, setYVis] = useState(existing?.visitation_target ? existing.visitation_target * 12 : '')
  const [yAcc, setYAcc] = useState(existing?.account_target ? existing.account_target * 12 : '')
  const [yDays, setYDays] = useState(existing?.working_days ? existing.working_days * 12 : '240')

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const getQuarterMonths = (q, y) => {
    const map = {
      Q1: ['01', '02', '03'],
      Q2: ['04', '05', '06'],
      Q3: ['07', '08', '09'],
      Q4: ['10', '11', '12']
    }
    return map[q].map(m => `${y}-${m}`)
  }

  const getYearMonths = (y) => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0')
      return `${y}-${m}`
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    try {
      if (level === 'monthly') {
        const numCash = Number(cashTarget) || 0
        const numDays = Number(workingDays) || 20
        const daily = numCash > 0 && numDays > 0 ? Math.round(numCash / numDays) : 0

        const res = await submitConfig({
          month: targetMonth,
          cash_target: numCash,
          visitation_target: Number(visTarget) || 0,
          account_target: Number(accTarget) || 0,
          daily_cash_target: daily,
          working_days: numDays,
          currency: 'GHS',
        })
        if (!res.success) throw new Error(res.error || 'Failed to save monthly targets.')
      } 
      else if (level === 'quarterly') {
        const months = getQuarterMonths(targetQuarter, quarterYear)
        const numCash = Number(qCash) || 0
        const numVis = Number(qVis) || 0
        const numAcc = Number(qAcc) || 0
        const numDays = Number(qDays) || 60

        // Divide values by 3 for each month
        const mCash = Math.round(numCash / 3)
        const mVis = Math.round(numVis / 3)
        const mAcc = Math.round(numAcc / 3)
        const mDays = Math.round(numDays / 3)
        const mDaily = mCash > 0 && mDays > 0 ? Math.round(mCash / mDays) : 0

        const promises = months.map(m => 
          submitConfig({
            month: m,
            cash_target: mCash,
            visitation_target: mVis,
            account_target: mAcc,
            daily_cash_target: mDaily,
            working_days: mDays,
            currency: 'GHS',
          })
        )
        const results = await Promise.all(promises)
        const failed = results.find(r => !r.success)
        if (failed) throw new Error(failed.error || 'Failed to save quarterly targets.')
      } 
      else if (level === 'yearly') {
        const months = getYearMonths(targetYear)
        const numCash = Number(yCash) || 0
        const numVis = Number(yVis) || 0
        const numAcc = Number(yAcc) || 0
        const numDays = Number(yDays) || 240

        // Divide values by 12 for each month
        const mCash = Math.round(numCash / 12)
        const mVis = Math.round(numVis / 12)
        const mAcc = Math.round(numAcc / 12)
        const mDays = Math.round(numDays / 12)
        const mDaily = mCash > 0 && mDays > 0 ? Math.round(mCash / mDays) : 0

        const promises = months.map(m => 
          submitConfig({
            month: m,
            cash_target: mCash,
            visitation_target: mVis,
            account_target: mAcc,
            daily_cash_target: mDaily,
            working_days: mDays,
            currency: 'GHS',
          })
        )
        const results = await Promise.all(promises)
        const failed = results.find(r => !r.success)
        if (failed) throw new Error(failed.error || 'Failed to save yearly targets.')
      }

      setFeedback({ ok: true, msg: 'Targets saved successfully!' })
      setTimeout(() => onSuccess && onSuccess(), 800)
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
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--rose-pale)' }}>Target Settings</h2>
            <p style={{ fontSize: 12, color: 'var(--rose-pastel)', marginTop: 2, fontWeight: 500 }}>
              Configure corporate goals
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Level Toggle */}
        <div style={styles.levelToggle}>
          {['monthly', 'quarterly', 'yearly'].map(l => (
            <button
              key={l}
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(level === l ? styles.toggleBtnActive : {})
              }}
              onClick={() => setLevel(l)}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Monthly Fields */}
          {level === 'monthly' && (
            <>
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

              <div style={styles.grid2}>
                <div style={styles.row}>
                  <label style={styles.label}>Visits Target</label>
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
                  <label style={styles.label}>Daily Cash Target</label>
                  <div style={styles.readOnlyInput}>
                    {formatCurrency(Number(cashTarget) > 0 && Number(workingDays) > 0 ? Math.round(Number(cashTarget) / Number(workingDays)) : 0)}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quarterly Fields */}
          {level === 'quarterly' && (
            <>
              <div style={styles.grid2}>
                <div style={styles.row}>
                  <label style={styles.label}>Select Quarter</label>
                  <select
                    value={targetQuarter}
                    onChange={e => setTargetQuarter(e.target.value)}
                    style={styles.input}
                  >
                    <option value="Q1">Q1 (Jan - Mar)</option>
                    <option value="Q2">Q2 (Apr - Jun)</option>
                    <option value="Q3">Q3 (Jul - Sep)</option>
                    <option value="Q4">Q4 (Oct - Dec)</option>
                  </select>
                </div>
                <div style={styles.row}>
                  <label style={styles.label}>Select Year</label>
                  <select
                    value={quarterYear}
                    onChange={e => setQuarterYear(e.target.value)}
                    style={styles.input}
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div style={styles.infoBadge}>
                ℹ️ Values will be divided equally across 3 months.
              </div>

              <div style={styles.row}>
                <label style={styles.label}>Quarterly Cash Target (GHS)</label>
                <input
                  type="number"
                  placeholder="e.g. 2580000"
                  value={qCash}
                  onChange={e => setQCash(e.target.value)}
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>

              <div style={styles.grid2}>
                <div style={styles.row}>
                  <label style={styles.label}>Quarter Visits</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={qVis}
                    onChange={e => setQVis(e.target.value)}
                    inputMode="numeric"
                    style={styles.input}
                  />
                </div>
                <div style={styles.row}>
                  <label style={styles.label}>Quarter Accounts</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={qAcc}
                    onChange={e => setQAcc(e.target.value)}
                    inputMode="numeric"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <label style={styles.label}>Total Working Days in Quarter</label>
                <input
                  type="number"
                  placeholder="60"
                  value={qDays}
                  onChange={e => setQDays(e.target.value)}
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>
            </>
          )}

          {/* Yearly Fields */}
          {level === 'yearly' && (
            <>
              <div style={styles.row}>
                <label style={styles.label}>Select Year</label>
                <select
                  value={targetYear}
                  onChange={e => setTargetYear(e.target.value)}
                  style={styles.input}
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div style={styles.infoBadge}>
                ℹ️ Values will be divided equally across 12 months.
              </div>

              <div style={styles.row}>
                <label style={styles.label}>Yearly Cash Target (GHS)</label>
                <input
                  type="number"
                  placeholder="e.g. 10320000"
                  value={yCash}
                  onChange={e => setYCash(e.target.value)}
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>

              <div style={styles.grid2}>
                <div style={styles.row}>
                  <label style={styles.label}>Yearly Visits</label>
                  <input
                    type="number"
                    placeholder="e.g. 720"
                    value={yVis}
                    onChange={e => setYVis(e.target.value)}
                    inputMode="numeric"
                    style={styles.input}
                  />
                </div>
                <div style={styles.row}>
                  <label style={styles.label}>Yearly Accounts</label>
                  <input
                    type="number"
                    placeholder="e.g. 240"
                    value={yAcc}
                    onChange={e => setYAcc(e.target.value)}
                    inputMode="numeric"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <label style={styles.label}>Total Working Days in Year</label>
                <input
                  type="number"
                  placeholder="240"
                  value={yDays}
                  onChange={e => setYDays(e.target.value)}
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>
            </>
          )}

          {feedback && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: feedback.ok ? 'rgba(42, 92, 61, 0.08)' : 'rgba(124, 43, 54, 0.08)',
              color: feedback.ok ? '#2A5C3D' : '#7C2B36',
              border: `1px solid ${feedback.ok ? 'rgba(42,92,61,0.2)' : 'rgba(124,43,54,0.2)'}`,
            }}>
              {feedback.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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
    background: 'rgba(201, 24, 74, 0.4)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: 'linear-gradient(135deg, var(--rose-light) 0%, var(--rose-mid) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 50px rgba(201, 24, 74, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'none',
    color: 'var(--rose-pale)',
    fontSize: 16,
    width: 32,
    height: 32,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelToggle: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 3,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: '8px 10px',
    background: 'none',
    border: 'none',
    borderRadius: 9,
    color: 'var(--rose-pastel)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: {
    background: 'rgba(255, 255, 255, 0.25)',
    color: 'var(--rose-pale)',
    boxShadow: '0 2px 8px rgba(201, 24, 74, 0.15)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--rose-pastel)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: 10,
    color: 'var(--rose-pale)',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    padding: '11px 12px',
    outline: 'none',
    width: '100%',
    colorScheme: 'dark',
  },
  readOnlyInput: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    color: 'var(--rose-pale)',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    padding: '11px 12px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  infoBadge: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12,
    color: 'var(--rose-pale)',
    fontWeight: 500,
  },
  cancelBtn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--rose-pale)',
    fontWeight: 600,
    fontSize: 14,
    padding: 12,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  submitBtn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.22)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    color: 'var(--rose-pale)',
    fontWeight: 700,
    fontSize: 14,
    padding: 12,
    borderRadius: 10,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 12px rgba(201, 24, 74, 0.15)',
  },
}
