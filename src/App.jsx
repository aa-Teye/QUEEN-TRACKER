import { useState, useEffect } from 'react'
import PinGate from './PinGate'

const SESSION_KEY = 'qt_unlocked'

function Dashboard() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #1a0f3c 0%, #2D1B69 50%, #1a0f3c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: 'linear-gradient(135deg, #4a2f9a, #2D1B69)',
        border: '1.5px solid rgba(245,200,66,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#F5C842', letterSpacing: -1 }}>QT</span>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5C842', marginBottom: 8 }}>
        Welcome back!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 280 }}>
        Dashboard coming in Sprint 3. Your backend is live and ready. 🚀
      </p>
      <div style={{
        marginTop: 40,
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        border: '1px solid rgba(245,200,66,0.2)',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
      }}>
        Sprint 1 ✅ · Sprint 2 ✅ · Sprint 3 🔜
      </div>
    </div>
  )
}

export default function App() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  )

  return unlocked
    ? <Dashboard />
    : <PinGate onUnlock={() => setUnlocked(true)} />
}
