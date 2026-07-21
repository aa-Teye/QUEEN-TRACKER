import { useState } from 'react'
import { submitBusiness } from '../lib/api'
import { formatCurrency, todayISO } from '../lib/format'

export default function BusinessTab({ biz, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  if (!biz) return null

  const net = biz.net_mtd || 0
  const netPositive = net >= 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    try {
      const res = await submitBusiness({
        business_id: biz.business_id,
        date,
        income: Number(income) || 0,
        expense: Number(expense) || 0,
        notes,
      })
      if (res.success) {
        setFeedback({ ok: true, msg: 'Transaction recorded.' })
        setIncome('')
        setExpense('')
        setNotes('')
        setTimeout(() => {
          setFeedback(null)
          setShowForm(false)
          onRefresh && onRefresh()
        }, 900)
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
    <div style={styles.container}>

      {/* Business name */}
      <div style={styles.nameCard}>
        <div style={styles.bizInitial}>
          {biz.name ? biz.name.charAt(0).toUpperCase() : 'B'}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{biz.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
            {biz.business_id}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div style={styles.summaryCard}>
        <SummaryRow label="Income MTD" value={formatCurrency(biz.income_mtd)} color="#43e97b" />
        <div style={styles.divider} />
        <SummaryRow label="Expenses MTD" value={formatCurrency(biz.expense_mtd)} color="#ff5f6d" />
        <div style={styles.divider} />
        <SummaryRow
          label="Net MTD"
          value={formatCurrency(net)}
          color={netPositive ? '#F5C842' : '#ff5f6d'}
          bold
        />
      </div>

      {/* Add Transaction */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Record Transaction</span>
          <button style={styles.linkBtn} onClick={() => setShowForm(f => !f)}>
            {showForm ? 'Close' : 'Add'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Field label="Income (GHS)" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0" />
            <Field label="Expense (GHS)" type="number" value={expense} onChange={e => setExpense(e.target.value)} placeholder="0" />
            <Field label="Notes (optional)" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="..." />

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

            <button type="submit" disabled={loading} style={{
              background: '#F5C842', color: '#1a0f3c', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12,
              padding: 14, cursor: 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Saving...' : 'Record Transaction'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 700 : 600, color }}>{value}</span>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={type === 'number' ? 'numeric' : undefined}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, color: '#fff', fontSize: 15,
          fontFamily: 'Inter, sans-serif', padding: '12px 14px',
          outline: 'none', width: '100%', colorScheme: 'dark',
        }}
      />
    </div>
  )
}

const styles = {
  container: { padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  nameCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '18px 16px',
  },
  bizInitial: {
    width: 48, height: 48, borderRadius: 14,
    background: 'linear-gradient(135deg, #4a2f9a, #2D1B69)',
    border: '1px solid rgba(245,200,66,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, color: '#F5C842', flexShrink: 0,
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '18px 16px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '18px 16px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  linkBtn: {
    background: 'none', border: 'none', color: '#F5C842',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px 0',
  },
}
