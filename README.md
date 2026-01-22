# 🎨 Color Clock - African Timezone Calendar

A calm, calendar-style time display built with React and Vite, showing major African time zones with a customizable accent theme.

## ✨ Features

- Local time header with full date
- Five African time zones shown in a single row
- 12h / 24h time toggle
- Custom accent picker with presets and modal UI
- Accent-tinted background gradient
- Responsive layout with Ubuntu typography

## 🚀 Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd color-clock

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 🛠️ Technologies

- React 18
- Vite
- Intl.DateTimeFormat
- CSS3

## 📸 Screenshot

![Color Clock Screenshot](screenshot.png)

## 🎯 How It Works

The app renders a local time summary plus five African time zone cards. Times update every second using a React interval. Formatting uses `Intl.DateTimeFormat` for each zone, with a toggle to switch 12h/24h output. The accent color picker updates the UI theme and background gradient in real time.

## 💻 Development
```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run preview # Preview production build
```

## 📦 Project Structure
```
color-clock/
├── src/
│   ├── App.jsx      # Main clock component
│   ├── App.css      # Styling and animations
│   └── main.jsx     # React entry point
├── package.json
└── README.md
```

## 🎨 Color Palette

- Primary: Soft neutral gradient (accent-tinted)
- Accent: User-selected via custom picker and presets
- Text: Charcoal with muted supporting tones

---

Made with ❤️ using React + Vite
