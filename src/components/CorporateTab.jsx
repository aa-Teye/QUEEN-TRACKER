import { useState, useEffect } from 'react'
import ProgressRing from './ProgressRing'
import DailyEntryForm from './DailyEntryForm'
import HistoryView from './HistoryView'
import TargetForm from './TargetForm'
import { formatCurrency, formatNumber, formatMonth, pct } from '../lib/format'

export default function CorporateTab({ corporate, month, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTargets, setShowTargets] = useState(false)
  const [viewMode, setViewMode] = useState('monthly') // 'monthly' | 'quarterly'

  const c = corporate || {}
  const isQuarterly = viewMode === 'quarterly'
  const multiplier = isQuarterly ? 3 : 1

  const activeCashTarget = (c.cash_target || 0) * multiplier
  const activeVisTarget = (c.visitation_target || 0) * multiplier
  const activeAccTarget = (c.account_target || 0) * multiplier

  const cashPct = pct(c.cash_mtd, activeCashTarget)
  const visPct = pct(c.visitations_mtd, activeVisTarget)
  const accPct = pct(c.accounts_mtd, activeAccTarget)

  const cashRemaining = activeCashTarget - (c.cash_mtd || 0)
  const visRemaining = activeVisTarget - (c.visitations_mtd || 0)
  const accRemaining = activeAccTarget - (c.accounts_mtd || 0)

  const variance = c.pacing_variance || 0
  const ahead = variance <= 0
  const varAmt = Math.abs(variance)

  return (
    <div style={styles.container}>

      {/* View Toggle Bar */}
      <div style={styles.viewToggleBar}>
        <button
          style={{
            ...styles.toggleBtn,
            ...(viewMode === 'monthly' ? styles.toggleBtnActive : {})
          }}
          onClick={() => setViewMode('monthly')}
        >
          Monthly View
        </button>
        <button
          style={{
            ...styles.toggleBtn,
            ...(viewMode === 'quarterly' ? styles.toggleBtnActive : {})
          }}
          onClick={() => setViewMode('quarterly')}
        >
          Quarterly View (3M)
        </button>
      </div>

      {/* Month + Pacing Banner */}
      <div style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7A5E65', letterSpacing: 1, textTransform: 'uppercase' }}>
            {isQuarterly ? 'Quarterly Target Overview' : `${formatMonth(month)} Targets`}
          </div>
          <button
            style={styles.editTargetsBtn}
            onClick={() => setShowTargets(true)}
          >
            ✨ Your Target Manager (Click to Edit)
          </button>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 14,
          padding: '8px 14px',
          borderRadius: 20,
          background: ahead ? 'rgba(42, 92, 61, 0.08)' : 'rgba(124, 43, 54, 0.08)',
          border: `1px solid ${ahead ? 'rgba(42, 92, 61, 0.2)' : 'rgba(124, 43, 54, 0.2)'}`,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: ahead ? '#2A5C3D' : '#7C2B36',
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: ahead ? '#2A5C3D' : '#7C2B36' }}>
            {ahead
              ? `Ahead of pace by ${formatCurrency(varAmt)}`
              : `Behind pace by ${formatCurrency(varAmt)}`}
          </span>
        </div>
      </div>

      {/* Progress Rings */}
      <div style={styles.ringsCard}>
        <ProgressRing
          percent={cashPct}
          label="Cash"
          sub={`${formatCurrency(c.cash_mtd)} of ${formatCurrency(activeCashTarget)}`}
        />
        <ProgressRing
          percent={visPct}
          label="Visitations"
          sub={`${formatNumber(c.visitations_mtd)} of ${formatNumber(activeVisTarget)}`}
        />
        <ProgressRing
          percent={accPct}
          label="Accounts"
          sub={`${formatNumber(c.accounts_mtd)} of ${formatNumber(activeAccTarget)}`}
        />
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <StatBox label="Cash Remaining" value={formatCurrency(cashRemaining)} />
        <StatBox label="Visits Left" value={formatNumber(visRemaining)} />
        <StatBox label="Accounts Left" value={formatNumber(accRemaining)} />
      </div>

      {/* Today's Entry */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Today's Entry</span>
          <button
            style={styles.linkBtn}
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? 'Close' : c.today_entry ? 'Edit' : 'Add Entry'}
          </button>
        </div>

        {!showForm && c.today_entry && (
          <div style={styles.todayGrid}>
            <TodayStat label="Cash" value={formatCurrency(c.today_entry.cash_collected)} />
            <TodayStat label="Visits" value={formatNumber(c.today_entry.visitations)} />
            <TodayStat label="Accounts" value={formatNumber(c.today_entry.accounts_opened)} />
          </div>
        )}

        {!showForm && !c.today_entry && (
          <p style={styles.emptyText}>No entry recorded for today.</p>
        )}

        {showForm && (
          <div style={{ marginTop: 16 }}>
            <DailyEntryForm
              existing={c.today_entry}
              onSuccess={() => {
                setShowForm(false)
                onRefresh && onRefresh()
              }}
            />
          </div>
        )}
      </div>

      {/* History */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Entry History</span>
          <button style={styles.linkBtn} onClick={() => setShowHistory(h => !h)}>
            {showHistory ? 'Hide' : 'View'}
          </button>
        </div>
        {showHistory && <HistoryView cashTarget={c.cash_target} />}
      </div>

      {/* Target Settings Modal */}
      {showTargets && (
        <TargetForm
          existing={c}
          month={month}
          onClose={() => setShowTargets(false)}
          onSuccess={() => {
            setShowTargets(false)
            onRefresh && onRefresh()
          }}
        />
      )}
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

function TodayStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#D4A373' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#7A5E65', marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

const styles = {
  container: { padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  viewToggleBar: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 3,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  toggleBtn: {
    flex: 1,
    padding: '8px 12px',
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
    background: 'rgba(255, 255, 255, 0.22)',
    color: 'var(--rose-pale)',
    boxShadow: '0 2px 8px rgba(201, 24, 74, 0.15)',
  },
  header: { paddingBottom: 4, textAlign: 'center' },
  editTargetsBtn: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'var(--rose-pale)',
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 16px',
    borderRadius: 12,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(201, 24, 74, 0.1)',
  },
  ringsCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: '24px 16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    boxShadow: '0 8px 32px rgba(201, 24, 74, 0.12)',
    backdropFilter: 'blur(16px)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: '14px 8px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(201, 24, 74, 0.08)',
    backdropFilter: 'blur(16px)',
  },
  statValue: { fontSize: 13, fontWeight: 700, color: 'var(--rose-pale)', wordBreak: 'break-word' },
  statLabel: { fontSize: 9, color: 'var(--rose-pastel)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 700 },
  card: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: '18px 16px',
    boxShadow: '0 8px 32px rgba(201, 24, 74, 0.12)',
    backdropFilter: 'blur(16px)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: 'var(--rose-pale)' },
  linkBtn: {
    background: 'none', border: 'none', color: 'var(--rose-pale)',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    padding: '4px 0',
  },
  emptyText: { fontSize: 13, color: 'var(--rose-pastel)', marginTop: 10, fontWeight: 500 },
  todayGrid: { display: 'flex', justifyContent: 'space-around', marginTop: 16 },
}
