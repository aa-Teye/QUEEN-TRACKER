const GHS = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const NUM = new Intl.NumberFormat('en-GH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(n) {
  return GHS.format(Number(n) || 0)
}

export function formatNumber(n) {
  return NUM.format(Number(n) || 0)
}

export function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00Z')
  return d.toLocaleDateString('en-GH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function formatMonth(str) {
  if (!str) return ''
  const [y, m] = str.split('-')
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1))
  return d.toLocaleDateString('en-GH', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function pct(value, target) {
  if (!target) return 0
  return Math.min(100, Math.round((value / target) * 100))
}
