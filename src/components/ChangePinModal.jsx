import { useState } from 'react'

export default function ChangePinModal({ onClose }) {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const actualCurrentPin = localStorage.getItem('qt_custom_pin') || import.meta.env.VITE_APP_PIN || '1234'

    if (currentPin !== actualCurrentPin) {
      setError('Current PIN is incorrect.')
      return
    }

    if (!newPin || newPin.length < 4) {
      setError('New PIN must be at least 4 digits.')
      return
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match.')
      return
    }

    localStorage.setItem('qt_custom_pin', newPin)
    setSuccess('PIN changed successfully!')
    setTimeout(() => {
      onClose()
    }, 900)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--rose-pale)' }}>Change Security PIN</h2>
            <p style={{ fontSize: 12, color: 'var(--rose-pastel)', marginTop: 2, fontWeight: 500 }}>
              Update your app entry passcode
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>Current PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={8}
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value)}
              inputMode="numeric"
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>New PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={8}
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              inputMode="numeric"
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Confirm New PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={8}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              inputMode="numeric"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.successAlert}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Change PIN
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
    zIndex: 110,
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
    maxWidth: 380,
    boxShadow: '0 20px 50px rgba(201, 24, 74, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
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
    letterSpacing: '3px',
  },
  errorAlert: {
    padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'rgba(255, 181, 167, 0.18)',
    color: '#FFB5A7',
    border: '1px solid rgba(255, 181, 167, 0.3)',
  },
  successAlert: {
    padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'rgba(216, 243, 220, 0.18)',
    color: 'var(--success)',
    border: '1px solid rgba(216, 243, 220, 0.3)',
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
    flex: 1.2,
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
