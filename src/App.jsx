import { useState, useEffect } from 'react'
import './App.css'

const TIME_ZONES = [
  { id: 'Africa/Casablanca', label: 'Morocco (Casablanca)' },
  { id: 'Africa/Lagos', label: 'Nigeria (Lagos)' },
  { id: 'Africa/Cairo', label: 'Egypt (Cairo)' },
  { id: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
  { id: 'Africa/Nairobi', label: 'Kenya (Nairobi)' },
]

const ACCENT_PRESETS = [
  { value: '#5b7c99', label: 'Slate' },
  { value: '#a06a4f', label: 'Clay' },
  { value: '#4c8a78', label: 'Teal' },
  { value: '#8a7b5f', label: 'Sand' },
  { value: '#c06b6b', label: 'Rosewood' },
]

const hexToRgb = (hex) => {
  const cleaned = hex.replace('#', '').trim()
  if (cleaned.length === 3) {
    const r = cleaned[0] + cleaned[0]
    const g = cleaned[1] + cleaned[1]
    const b = cleaned[2] + cleaned[2]
    return {
      r: Number.parseInt(r, 16),
      g: Number.parseInt(g, 16),
      b: Number.parseInt(b, 16),
    }
  }
  if (cleaned.length !== 6) return null
  return {
    r: Number.parseInt(cleaned.slice(0, 2), 16),
    g: Number.parseInt(cleaned.slice(2, 4), 16),
    b: Number.parseInt(cleaned.slice(4, 6), 16),
  }
}

const mixRgb = (base, target, weight) => ({
  r: Math.round(base.r + (target.r - base.r) * weight),
  g: Math.round(base.g + (target.g - base.g) * weight),
  b: Math.round(base.b + (target.b - base.b) * weight),
})

const toCssRgb = (rgb) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

const buildAccentStyles = (hex) => {
  const fallback = { r: 91, g: 124, b: 153 }
  const rgb = hexToRgb(hex) || fallback
  const bgStart = mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.86)
  const bgEnd = mixRgb(rgb, { r: 226, g: 231, b: 240 }, 0.78)
  return {
    '--accent-color': toCssRgb(rgb),
    '--accent-soft': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
    '--accent-border': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
    '--bg-start': toCssRgb(bgStart),
    '--bg-end': toCssRgb(bgEnd),
  }
}

const getCalendarParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const parts = formatter.formatToParts(date)
  const pick = (type) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    weekday: pick('weekday'),
    month: pick('month'),
    day: pick('day'),
    year: pick('year'),
  }
}

const getTimeString = (date, timeZone, use24Hour) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: use24Hour ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  }).format(date)

function App() {
  // State to hold current time
  const [currentTime, setCurrentTime] = useState(new Date())
  const [accentColor, setAccentColor] = useState('#5b7c99')
  const [selectedZone, setSelectedZone] = useState(TIME_ZONES[0].id)
  const [use24Hour, setUse24Hour] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(timer)
  }, [])

  const { month, year, day, weekday } = getCalendarParts(
    currentTime,
    selectedZone
  )
  const time = getTimeString(currentTime, selectedZone, use24Hour)

  return (
    <div className="clock-container" style={buildAccentStyles(accentColor)}>
      <div className="calendar-card">
        <div className="calendar-header">
          <div className="calendar-month">{month}</div>
          <div className="calendar-year">{year}</div>
        </div>
        <div className="calendar-day">{day}</div>
        <div className="calendar-weekday">{weekday}</div>
        <div className="calendar-time">{time}</div>
        <div className="calendar-controls">
          <div className="timezone-controls">
            <label className="timezone-label" htmlFor="timezone-select">
              Time zone
            </label>
            <select
              id="timezone-select"
              value={selectedZone}
              onChange={(event) => setSelectedZone(event.target.value)}
            >
              {TIME_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>
          <div className="format-controls">
            <span className="format-label">Time format</span>
            <div className="format-toggle" role="group" aria-label="Time format">
              <button
                type="button"
                className={!use24Hour ? 'is-active' : ''}
                onClick={() => setUse24Hour(false)}
                aria-pressed={!use24Hour}
              >
                12h
              </button>
              <button
                type="button"
                className={use24Hour ? 'is-active' : ''}
                onClick={() => setUse24Hour(true)}
                aria-pressed={use24Hour}
              >
                24h
              </button>
            </div>
          </div>
          <div className="color-controls">
            <label className="color-label" htmlFor="accent-color">
              Accent
            </label>
            <div className="color-picker">
              <input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                aria-label="Choose accent color"
              />
              <span className="color-value">{accentColor.toUpperCase()}</span>
            </div>
            <div className="color-presets" role="group" aria-label="Preset accents">
              {ACCENT_PRESETS.map((preset) => {
                const isActive =
                  preset.value.toLowerCase() === accentColor.toLowerCase()
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`color-swatch${isActive ? ' is-active' : ''}`}
                    style={{ backgroundColor: preset.value }}
                    onClick={() => setAccentColor(preset.value)}
                    title={preset.label}
                    aria-label={preset.label}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="clock-subtitle">Made with React</div>
      </div>
    </div>
  )
}

export default App
