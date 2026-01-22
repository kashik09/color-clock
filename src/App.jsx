import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // State to hold current time
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(timer)
  }, [])

  const formattedDateTime = format(currentTime, 'EEEE, MMMM d, yyyy - h:mm:ss a')

  return (
    <div className="clock-container">
      <div className="clock-card">
        <h1 className="clock-title">🎨 COLOR CLOCK 🎨</h1>
        <p className="clock-time">{formattedDateTime}</p>
        <div className="clock-subtitle">Made with React & date-fns</div>
      </div>
    </div>
  )
}

export default App