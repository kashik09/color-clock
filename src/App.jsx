import { useState, useEffect } from 'react'
import './App.css'

const TIME_ZONES = [
  { id: 'Africa/Casablanca', label: 'Morocco (Casablanca)' },
  { id: 'Africa/Lagos', label: 'Nigeria (Lagos)' },
  { id: 'Africa/Cairo', label: 'Egypt (Cairo)' },
  { id: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
  { id: 'Africa/Nairobi', label: 'Kenya (Nairobi)' },
]

const DEFAULT_ACCENT = '#5B7C99'

const ACCENT_PRESETS = [
  { value: DEFAULT_ACCENT, label: 'Slate' },
  { value: '#a06a4f', label: 'Clay' },
  { value: '#4c8a78', label: 'Teal' },
  { value: '#8a7b5f', label: 'Sand' },
  { value: '#c06b6b', label: 'Rosewood' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

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

const rgbToHex = (rgb) => {
  const toHex = (value) => value.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase()
}

const rgbToHsv = (rgb) => {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6
    } else if (max === g) {
      hue = (b - r) / delta + 2
    } else {
      hue = (r - g) / delta + 4
    }
    hue *= 60
    if (hue < 0) hue += 360
  }

  const saturation = max === 0 ? 0 : delta / max
  const value = max
  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    v: Math.round(value * 100),
  }
}

const hsvToRgb = (hsv) => {
  const h = hsv.h
  const s = hsv.s / 100
  const v = hsv.v / 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
  } else if (h >= 120 && h < 180) {
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

const hexToHsv = (hex) => {
  const rgb = hexToRgb(hex)
  if (!rgb || Number.isNaN(rgb.r)) return null
  return rgbToHsv(rgb)
}

const normalizeHex = (value) => {
  const cleaned = value.trim().replace('#', '')
  const isValid = /^[0-9a-fA-F]+$/.test(cleaned)
  if (!isValid) return null
  if (cleaned.length === 3 || cleaned.length === 6) {
    return `#${cleaned}`.toUpperCase()
  }
  return null
}

const mixRgb = (base, target, weight) => ({
  r: Math.round(base.r + (target.r - base.r) * weight),
  g: Math.round(base.g + (target.g - base.g) * weight),
  b: Math.round(base.b + (target.b - base.b) * weight),
})

const toCssRgb = (rgb) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

const buildAccentStyles = (hex) => {
  const fallback = hexToRgb(DEFAULT_ACCENT)
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
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  if (timeZone) {
    options.timeZone = timeZone
  }
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(date)
  const pick = (type) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    weekday: pick('weekday'),
    month: pick('month'),
    day: pick('day'),
    year: pick('year'),
  }
}

const getTimeString = (date, timeZone, use24Hour) => {
  const options = {
    hour: use24Hour ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  }
  if (timeZone) {
    options.timeZone = timeZone
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

function App() {
  // State to hold current time
  const [currentTime, setCurrentTime] = useState(new Date())
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [picker, setPicker] = useState(
    () => hexToHsv(DEFAULT_ACCENT) || { h: 210, s: 40, v: 60 }
  )
  const [hexInput, setHexInput] = useState(DEFAULT_ACCENT)
  const [use24Hour, setUse24Hour] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isPickerOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPickerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPickerOpen])

  const updateAccentFromHsv = (next) => {
    const nextRgb = hsvToRgb(next)
    const nextHex = rgbToHex(nextRgb)
    setPicker(next)
    setAccentColor(nextHex)
    setHexInput(nextHex)
  }

  const setAccentFromHex = (value) => {
    const normalized = normalizeHex(value)
    if (!normalized) return
    const nextHsv = hexToHsv(normalized) || picker
    setAccentColor(normalized)
    setHexInput(normalized)
    setPicker(nextHsv)
  }

  const updateSvFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)
    updateAccentFromHsv({
      h: picker.h,
      s: Math.round(x * 100),
      v: Math.round((1 - y) * 100),
    })
  }

  const handleSvPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateSvFromEvent(event)
  }

  const handleSvPointerMove = (event) => {
    if (event.buttons !== 1) return
    updateSvFromEvent(event)
  }

  const handleHueChange = (event) => {
    updateAccentFromHsv({
      ...picker,
      h: Number(event.target.value),
    })
  }

  const handleHexInputChange = (event) => {
    setHexInput(event.target.value.toUpperCase())
  }

  const handleHexInputBlur = () => {
    const normalized = normalizeHex(hexInput)
    if (normalized) {
      setAccentFromHex(normalized)
    } else {
      setHexInput(accentColor)
    }
  }

  const handleHexInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleHexInputBlur()
    }
    if (event.key === 'Escape') {
      setHexInput(accentColor)
    }
  }

  const localParts = getCalendarParts(currentTime)
  const localTime = getTimeString(currentTime, null, use24Hour)

  return (
    <div className="clock-container" style={buildAccentStyles(accentColor)}>
      <div className="clock-shell">
        <div className="local-summary">
          <div className="local-label">Local time</div>
          <div className="local-time">{localTime}</div>
          <div className="local-date">
            {localParts.weekday}, {localParts.month} {localParts.day},{' '}
            {localParts.year}
          </div>
        </div>
        <div className="controls-card">
          <div className="clock-controls">
            <div className="format-controls">
              <span className="format-label">Time format</span>
              <div
                className="format-toggle"
                role="group"
                aria-label="Time format"
              >
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
              <span className="color-label">Accent</span>
              <button
                type="button"
                className="accent-button"
                onClick={() => setIsPickerOpen(true)}
              >
                <span
                  className="accent-dot"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="accent-text">Customize</span>
                <span className="accent-value">{accentColor}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="calendar-grid">
          {TIME_ZONES.map((zone) => {
            const { month, year, day, weekday } = getCalendarParts(
              currentTime,
              zone.id
            )
            const time = getTimeString(currentTime, zone.id, use24Hour)
            return (
              <div key={zone.id} className="calendar-card">
                <div className="calendar-header">
                  <div className="calendar-location">{zone.label}</div>
                </div>
                <div className="calendar-day">{day}</div>
                <div className="calendar-date">
                  {weekday}, {month} {year}
                </div>
                <div className="calendar-time">{time}</div>
              </div>
            )
          })}
        </div>
        <div className="clock-subtitle">Made with React</div>
      </div>
      {isPickerOpen ? (
        <div
          className="modal-backdrop"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="modal-card color-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Accent color picker"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">Accent color</div>
                <div className="modal-subtitle">
                  Pick a new tint for the interface.
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsPickerOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="color-picker">
                <div
                  className="sv-picker"
                  style={{ '--picker-hue': picker.h }}
                  onPointerDown={handleSvPointerDown}
                  onPointerMove={handleSvPointerMove}
                  role="slider"
                  aria-label="Saturation and brightness"
                  aria-valuetext={`${picker.s}% saturation, ${picker.v}% brightness`}
                >
                  <div
                    className="sv-handle"
                    style={{
                      left: `${picker.s}%`,
                      top: `${100 - picker.v}%`,
                    }}
                  />
                </div>
                <div className="hue-row">
                  <input
                    className="hue-slider"
                    type="range"
                    min="0"
                    max="360"
                    value={picker.h}
                    onChange={handleHueChange}
                    aria-label="Hue"
                  />
                  <div className="color-preview" style={{ color: accentColor }}>
                    <span className="color-preview-dot" />
                    <span className="color-value">{accentColor}</span>
                  </div>
                </div>
                <div className="hex-row">
                  <span className="hex-label">Hex</span>
                  <input
                    id="hex-input"
                    className="hex-input"
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    onBlur={handleHexInputBlur}
                    onKeyDown={handleHexInputKeyDown}
                    placeholder="#5B7C99"
                  />
                </div>
              </div>
              <div
                className="color-presets"
                role="group"
                aria-label="Preset accents"
              >
                {ACCENT_PRESETS.map((preset) => {
                  const isActive =
                    preset.value.toLowerCase() === accentColor.toLowerCase()
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      className={`color-swatch${isActive ? ' is-active' : ''}`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setAccentFromHex(preset.value)}
                      title={preset.label}
                      aria-label={preset.label}
                    />
                  )
                })}
              </div>
              <button
                type="button"
                className="modal-done"
                onClick={() => setIsPickerOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
