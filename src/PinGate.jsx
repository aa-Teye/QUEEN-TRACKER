import { useState, useCallback } from 'react'

const CORRECT_PIN = import.meta.env.VITE_APP_PIN || '1234'
const SESSION_KEY = 'qt_unlocked'

function PinDot({ filled }) {
  return (
    <div style={{
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: filled ? 'var(--gold)' : 'var(--white-20)',
      border: '2px solid',
      borderColor: filled ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
      transition: 'all 0.2s ease',
      transform: filled ? 'scale(1.2)' : 'scale(1)'
    }} />
  )
}

function PinButton({ label, onClick, disabled }) {
  const [pressed, setPressed] = useState(false)

  const handlePress = () => {
    if (disabled) return
    setPressed(true)
    setTimeout(() => setPressed(false), 150)
    onClick(label)
  }

  return (
    <button
      onClick={handlePress}
      disabled={disabled}
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.15)',
        background: pressed
          ? 'rgba(245, 200, 66, 0.25)'
          : 'rgba(255,255,255,0.08)',
        color: 'var(--white)',
        fontSize: label === '⌫' ? 22 : 26,
        fontWeight: label === '⌫' ? 400 : 600,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        boxShadow: pressed
          ? '0 0 20px rgba(245,200,66,0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
}

export default function PinGate({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const PIN_LENGTH = CORRECT_PIN.length

  const handleDigit = useCallback((digit) => {
    if (pin.length >= PIN_LENGTH) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          sessionStorage.setItem(SESSION_KEY, '1')
          onUnlock()
        } else {
          setShake(true)
          setError('Incorrect PIN. Try again.')
          setTimeout(() => {
            setPin('')
            setShake(false)
          }, 600)
        }
      }, 150)
    }
  }, [pin, PIN_LENGTH, onUnlock])

  const handleDelete = useCallback(() => {
    setPin(p => p.slice(0, -1))
    setError('')
  }, [])

  const keys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫']
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(160deg, #1a0f3c 0%, #2D1B69 50%, #1a0f3c 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo / Wordmark */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #4a2f9a, #2D1B69)',
          border: '1.5px solid rgba(245,200,66,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#F5C842', letterSpacing: -1 }}>QT</span>
        </div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--white)',
          letterSpacing: 0.5,
          marginBottom: 6
        }}>
          The Queenly Tracker
        </h1>
        <p style={{ fontSize: 13, color: 'var(--white-70)', fontWeight: 400 }}>
          Enter your PIN to continue
        </p>
      </div>

      {/* PIN dots */}
      <div
        className={shake ? 'animate-shake' : ''}
        style={{
          display: 'flex',
          gap: 18,
          marginBottom: 12,
        }}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <PinDot key={i} filled={i < pin.length} />
        ))}
      </div>

      {/* Error message */}
      <div style={{
        height: 28,
        display: 'flex',
        alignItems: 'center',
        marginBottom: 32,
      }}>
        {error && (
          <p style={{
            color: 'var(--error)',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease',
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Keypad */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {keys.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {row.map((key, ki) => {
              if (key === '') return <div key={ki} style={{ width: 72, height: 72 }} />
              return (
                <PinButton
                  key={ki}
                  label={key}
                  disabled={pin.length === PIN_LENGTH && key !== '⌫'}
                  onClick={key === '⌫' ? handleDelete : handleDigit}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
