const FALLBACK_URL = "https://script.google.com/macros/s/AKfycbza100oGP4bntmlInSLVKCF8jjN-2GhSIWlkAiUTdgcfnhvsrhflAp9GKt-XqNcYmbY/exec"
const BASE = import.meta.env.VITE_APP_API_URL || FALLBACK_URL

async function request(url, options = {}) {
  const fetchOptions = {
    redirect: 'follow',
    ...options,
  }
  const res = await fetch(url, fetchOptions)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    console.error('Failed to parse server response:', text)
    throw new Error('Invalid server response')
  }
}

export function getDashboard() {
  return request(`${BASE}?action=dashboard`)
}

export function getHistory(range = 30) {
  return request(`${BASE}?action=history&range=${range}`)
}

export function submitDaily(data) {
  return request(`${BASE}?action=submitDaily`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
}

export function submitBusiness(data) {
  return request(`${BASE}?action=submitBusiness`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
}

export function submitConfig(data) {
  return request(`${BASE}?action=submitConfig`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
}

