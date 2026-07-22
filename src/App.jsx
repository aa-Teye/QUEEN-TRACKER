import { useState, useEffect, useCallback } from 'react'
import PinGate from './PinGate'
import CorporateTab from './components/CorporateTab'
import BusinessTab from './components/BusinessTab'
import ChangePinModal from './components/ChangePinModal'
import { getDashboard } from './lib/api'

const SESSION_KEY = 'qt_unlocked'

function MainApp() {
  const [tab, setTab] = useState('corporate')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboard()
      if (data.success === false) throw new Error(data.error)
      setDashboard(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const businesses = dashboard?.businesses || []
  const tabs = [
    { id: 'corporate', label: 'Corporate' },
    ...businesses.map(b => ({ id: b.business_id, label: b.name }))
  ]

  return (
    <div style={styles.root}>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoText}>QT</span>
        </div>
        <span style={styles.appName}>Hello, Queen</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={styles.refreshBtn} onClick={load} title="Refresh">
            {loading ? '...' : '↺'}
          </button>
          <button style={styles.refreshBtn} onClick={() => setShowSettings(true)} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.tabBtn,
              ...(tab === t.id ? styles.tabActive : {})
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label === 'Corporate' ? 'Corporate' : t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.content}>
        {error && (
          <div style={styles.errorBox}>
            <strong>Could not load data.</strong>
            <br />{error}
            <br />
            <button style={styles.retryBtn} onClick={load}>Retry</button>
          </div>
        )}

        {loading && !dashboard && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ fontSize: 13, color: '#7A5E65', marginTop: 16, fontWeight: 500 }}>
              Loading data...
            </p>
          </div>
        )}

        {dashboard && !error && (
          <>
            {tab === 'corporate' && (
              <CorporateTab
                corporate={dashboard.corporate}
                month={dashboard.month}
                onRefresh={load}
              />
            )}
            {businesses.map(b => (
              tab === b.business_id && (
                <BusinessTab key={b.business_id} biz={b} onRefresh={load} />
              )
            ))}
          </>
        )}
      </main>

      {/* Settings / Change PIN Modal */}
      {showSettings && (
        <ChangePinModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  )

  return unlocked
    ? <MainApp />
    : <PinGate onUnlock={() => setUnlocked(true)} />
}

const styles = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, var(--rose-light) 0%, var(--rose-mid) 50%, var(--rose-dark) 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(201, 24, 74, 0.85)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  logo: {
    width: 32, height: 32, borderRadius: 9,
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 13, fontWeight: 800, color: 'var(--rose-pale)', letterSpacing: -0.5 },
  appName: { fontSize: 16, fontWeight: 800, color: 'var(--rose-pale)', flex: 1, fontFamily: 'Inter, sans-serif' },
  refreshBtn: {
    background: 'none', border: 'none', color: 'var(--rose-pastel)',
    fontSize: 20, cursor: 'pointer', padding: '4px 8px', fontFamily: 'Inter, sans-serif',
  },
  tabBar: {
    display: 'flex',
    overflowX: 'auto',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(201, 24, 74, 0.85)',
    scrollbarWidth: 'none',
    position: 'sticky',
    top: 57,
    zIndex: 9,
    backdropFilter: 'blur(12px)',
  },
  tabBtn: {
    flexShrink: 0,
    padding: '13px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--rose-pastel)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s, border-color 0.2s',
  },
  tabActive: {
    color: 'var(--rose-pale)',
    borderBottomColor: 'var(--rose-pale)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
  },
  errorBox: {
    margin: 24,
    padding: '18px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 12,
    fontSize: 13,
    color: '#FFB5A7',
    lineHeight: 1.6,
  },
  retryBtn: {
    marginTop: 10,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'var(--rose-pale)',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 32, height: 32,
    border: '3px solid rgba(255,255,255,0.15)',
    borderTopColor: 'var(--rose-pale)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
