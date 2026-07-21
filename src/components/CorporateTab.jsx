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

  const c = corporate || {}
  const cashPct = pct(c.cash_mtd, c.cash_target)
  const visPct = pct(c.visitations_mtd, c.visitation_target)
  const accPct = pct(c.accounts_mtd, c.account_target)
  const variance = c.pacing_variance || 0
  const ahead = variance <= 0
  const varAmt = Math.abs(variance)

  return (
    <div style={styles.container}>

      {/* Month + Pacing Banner */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>
            {formatMonth(month)} Targets
          </div>
          <button
            style={styles.editTargetsBtn}
            onClick={() => setShowTargets(true)}
          >
            ⚙ Edit Targets
          </button>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          padding: '8px 14px',
          borderRadius: 20,
          background: ahead ? 'rgba(67,233,123,0.1)' : 'rgba(255,95,109,0.1)',
          border: `1px solid ${ahead ? 'rgba(67,233,123,0.25)' : 'rgba(255,95,109,0.25)'}`,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: ahead ? '#43e97b' : '#ff5f6d',
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: ahead ? '#43e97b' : '#ff5f6d' }}>
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
          sub={`${formatCurrency(c.cash_mtd)} of ${formatCurrency(c.cash_target)}`}
        />
        <ProgressRing
          percent={visPct}
          label="Visitations"
          sub={`${formatNumber(c.visitations_mtd)} of ${formatNumber(c.visitation_target)}`}
        />
        <ProgressRing
          percent={accPct}
          label="Accounts"
          sub={`${formatNumber(c.accounts_mtd)} of ${formatNumber(c.account_target)}`}
        />
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <StatBox label="Cash Remaining" value={formatCurrency(c.cash_remaining)} />
        <StatBox label="Visits Left" value={formatNumber(c.visitations_remaining)} />
        <StatBox label="Accounts Left" value={formatNumber(c.accounts_remaining)} />
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
      <div style={{ fontSize: 16, fontWeight: 700, color: '#F5C842' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

const styles = {
  container: { padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 },
  header: { paddingBottom: 4 },
  editTargetsBtn: {
    background: 'rgba(245,200,66,0.12)',
    border: '1px solid rgba(245,200,66,0.35)',
    color: '#F5C842',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  ringsCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '24px 16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
  },
  statBox: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px 8px',
    textAlign: 'center',
  },
  statValue: { fontSize: 14, fontWeight: 700, color: '#fff', wordBreak: 'break-word' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '18px 16px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  linkBtn: {
    background: 'none', border: 'none', color: '#F5C842',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    padding: '4px 0',
  },
  emptyText: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 10 },
  todayGrid: { display: 'flex', justifyContent: 'space-around', marginTop: 16 },
}
