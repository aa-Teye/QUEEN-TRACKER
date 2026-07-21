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
          <div style={{ fontSize: 18, fontWeight: 800, color: '#4A2E35' }}>{biz.name}</div>
          <div style={{ fontSize: 12, color: '#7A5E65', marginTop: 2, fontWeight: 500 }}>
            {biz.business_id}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div style={styles.summaryCard}>
        <SummaryRow label="Income MTD" value={formatCurrency(biz.income_mtd)} color="#2A5C3D" />
        <div style={styles.divider} />
        <SummaryRow label="Expenses MTD" value={formatCurrency(biz.expense_mtd)} color="#7C2B36" />
        <div style={styles.divider} />
        <SummaryRow
          label="Net MTD"
          value={formatCurrency(net)}
          color={netPositive ? '#D4A373' : '#7C2B36'}
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
                background: feedback.ok ? 'rgba(42, 92, 61, 0.08)' : 'rgba(124, 43, 54, 0.08)',
                color: feedback.ok ? '#2A5C3D' : '#7C2B36',
                border: `1px solid ${feedback.ok ? 'rgba(42,92,61,0.2)' : 'rgba(124,43,54,0.2)'}`,
              }}>
                {feedback.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#D4A373', color: '#fff', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12,
              padding: 14, cursor: 'pointer', opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(212, 163, 115, 0.2)',
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
      <span style={{ fontSize: 13, color: '#7A5E65', fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 17 : 14, fontWeight: bold ? 700 : 600, color }}>{value}</span>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#7A5E65', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={type === 'number' ? 'numeric' : undefined}
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(74, 46, 53, 0.12)',
          borderRadius: 10, color: '#4A2E35', fontSize: 15,
          fontFamily: 'Inter, sans-serif', padding: '12px 14px',
          outline: 'none', width: '100%', colorScheme: 'light',
        }}
      />
    </div>
  )
}

const styles = {
  container: { padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  nameCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(74, 46, 53, 0.08)',
    borderRadius: 16, padding: '18px 16px',
    boxShadow: '0 8px 24px rgba(74, 46, 53, 0.03)',
    backdropFilter: 'blur(8px)',
  },
  bizInitial: {
    width: 48, height: 48, borderRadius: 14,
    background: 'linear-gradient(135deg, #FFFDF9, #FFF0F2)',
    border: '1px solid #D4A373',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, color: '#D4A373', flexShrink: 0,
  },
  summaryCard: {
    background: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(74, 46, 53, 0.08)',
    borderRadius: 16, padding: '18px 16px',
    display: 'flex', flexDirection: 'column', gap: 12,
    boxShadow: '0 8px 24px rgba(74, 46, 53, 0.03)',
    backdropFilter: 'blur(8px)',
  },
  divider: { height: 1, background: 'rgba(74, 46, 53, 0.06)' },
  card: {
    background: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(74, 46, 53, 0.08)',
    borderRadius: 16, padding: '18px 16px',
    boxShadow: '0 8px 24px rgba(74, 46, 53, 0.03)',
    backdropFilter: 'blur(8px)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#4A2E35' },
  linkBtn: {
    background: 'none', border: 'none', color: '#D4A373',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: '4px 0',
  },
}
