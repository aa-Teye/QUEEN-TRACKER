import { useState, useCallback } from 'react'

const SESSION_KEY = 'qt_unlocked'

function getExpectedPin() {
  return localStorage.getItem('qt_custom_pin') || import.meta.env.VITE_APP_PIN || '1234'
}

function PinDot({ filled }) {
  return (
    <div style={{
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: filled ? '#FF4D6D' : 'rgba(92, 13, 38, 0.1)',
      border: '2px solid',
      borderColor: filled ? '#FF4D6D' : 'rgba(92, 13, 38, 0.25)',
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
        border: '1.5px solid rgba(92, 13, 38, 0.08)',
        background: pressed
          ? 'rgba(255, 77, 109, 0.15)'
          : 'rgba(255, 255, 255, 0.88)',
        color: '#5C0D26',
        fontSize: label === '⌫' ? 22 : 26,
        fontWeight: label === '⌫' ? 400 : 600,
        fontFamily: 'Inter, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        boxShadow: pressed
          ? '0 0 15px rgba(255, 77, 109, 0.2)'
          : '0 2px 8px rgba(92, 13, 38, 0.04)',
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
  
  const expectedPin = getExpectedPin()
  const PIN_LENGTH = expectedPin.length

  const handleDigit = useCallback((digit) => {
    if (pin.length >= PIN_LENGTH) return
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => {
        if (newPin === expectedPin) {
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
  }, [pin, PIN_LENGTH, expectedPin, onUnlock])

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
      background: 'linear-gradient(135deg, #FFE5EC 0%, #FFC2D1 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 77, 109, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo / Wordmark */}
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #FFFDF9, #FFF0F2)',
          border: '1.5px solid #FF4D6D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(255, 77, 109, 0.1)',
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#FF4D6D', letterSpacing: -1 }}>QT</span>
        </div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#5C0D26',
          letterSpacing: -0.5,
          marginBottom: 6
        }}>
          Welcome, Selly
        </h1>
        <p style={{ fontSize: 14, color: '#7C2B36', fontWeight: 500 }}>
          Kindly enter your PIN
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
            fontWeight: 600,
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
