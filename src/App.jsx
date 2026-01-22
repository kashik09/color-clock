// Import the format function from date-fns to format our date and time
import { format } from 'date-fns'
import './App.css'

function App() {
  // Get the current date and time
  const now = new Date()
  
  // Format the date and time using date-fns
  // EEEE = full day name, MMMM = full month name
  // d = day of month, yyyy = year
  // h:mm:ss = time with AM/PM
  const formattedDateTime = format(now, 'EEEE, MMMM d, yyyy - h:mm:ss a')

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