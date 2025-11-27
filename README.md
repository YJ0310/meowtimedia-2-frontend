# 🐾 Meowtimap

> Collect cultures. Earn stamps. Fall in love with Asia.

A beautiful, gamified journey through Asian culture built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.

## ✨ Features

### 🗺️ Interactive Map Dashboard
- Explore 10 Asian countries with glowing animated pins
- Real-time progress tracking with beautiful circular progress indicators
- Collapsible sidebar showing your passport stats and country progress
- Smooth map zoom and country detail panels

### 🏛️ Rich Country Pages
- **10 Fully Implemented Countries**: Japan, South Korea, China, Thailand, Vietnam, Indonesia, Malaysia, Philippines, Singapore, India
- **80+ Cultural Topics** across all countries
- Topics include: Food, Language, History, Festivals, Etiquette, Landmarks, Pop Culture, and Traditions
- Interactive topic cards with locked/unlocked states
- Real progress tracking for each country

### 📚 Interactive Lessons
- **3 Complete Lesson Pages** with rich educational content:
  - 🍣 Japan: Sushi Culture
  - 🎤 South Korea: K-Pop History  
  - 💦 Thailand: Songkran Festival
- Multiple sections with beautiful Unsplash images
- Interactive quizzes (4 questions each)
- Real-time answer validation with smooth animations
- Confetti celebration on stamp earning

### 🎫 Digital Passport
- Stunning flipbook-style passport interface
- Beautiful visa stamp designs with watercolor effects
- Smooth page-turning animations
- Track all 12 collected stamps
- Empty slots for future adventures

### 🎨 Design System
Custom soft Asian-inspired color palette:
- **Primary**: #A8BEDF (soft blue)
- **Secondary**: #C7D5E8(light lavender)
- **Accent**: #EFE4D4 (warm cream)
- **Neutral**: #D8C9BA (beige taupe)

Premium fonts:
- **Headings**: Playfair Display (luxurious serif)
- **Body**: Inter (clean sans-serif)

### 🌟 Special Features
- 🌓 Dark/Light mode toggle
- 🐾 Cat paw easter eggs throughout
- ✨ Glassmorphism with backdrop-blur effects
- 🎆 Canvas confetti celebrations
- 📱 Fully responsive mobile design
- 🎭 Smooth Framer Motion animations everywhere

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
meowtimedia-2-frontend/
├── app/
│   ├── page.tsx                          # Landing page with animated map
│   ├── layout.tsx                        # Root layout with Navbar
│   ├── globals.css                       # Global styles & animations
│   ├── dashboard/
│   │   └── page.tsx                      # Interactive map dashboard
│   ├── country/
│   │   └── [slug]/
│   │       └── page.tsx                  # Dynamic country pages (10 countries)
│   ├── learn/
│   │   └── [countrySlug]/
│   │       └── [topicSlug]/
│   │           └── page.tsx              # Lesson pages with quizzes
│   └── passport/
│       └── page.tsx                      # Passport flipbook viewer
├── components/
│   ├── navbar.tsx                        # Global navigation
│   ├── progress-circle.tsx               # Circular progress indicator
│   ├── stamp-badge.tsx                   # Stamp display with confetti
│   └── topic-card.tsx                    # Learning topic cards
├── lib/
│   ├── types.ts                          # TypeScript interfaces
│   ├── mock-data.ts                      # All mock data (user, countries, topics, lessons)
│   └── utils.ts                          # Utility functions
└── tailwind.config.ts                    # Custom Tailwind configuration
```

## 🎮 User Flow

1. **Landing Page** (`/`) - Beautiful introduction with animated Asia map
2. **Dashboard** (`/dashboard`) - Interactive map to select countries
3. **Country Page** (`/country/japan`) - View topics and progress
4. **Lesson Page** (`/learn/japan/sushi-culture`) - Learn and take quiz
5. **Passport** (`/passport`) - View collected stamps

## 🎨 Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Celebrations**: canvas-confetti
- **Icons**: Lucide React

## 👤 Mock User

The app uses a hardcoded mock user (no authentication):
- **Name**: Yin Jia
- **Email**: yinjia@example.com
- **Total Stamps**: 12/48

## 🌏 Countries & Content

All 10 countries have:
- Unique flag and coordinates
- Progress percentage
- 8 cultural topics each
- Fun facts and descriptions
- Real collected stamps

3 countries have complete lesson content:
- **Japan**: Sushi Culture (4 sections, 4 quiz questions)
- **South Korea**: K-Pop History (4 sections, 4 quiz questions)
- **Thailand**: Songkran Festival (4 sections, 4 quiz questions)

## 🎯 Key Features Implementation

### Glassmorphism
All cards use `backdrop-blur-xl` with semi-transparent backgrounds for that premium frosted glass effect.

### Animations
- SVG path animations for maps
- Page transitions with Framer Motion
- Smooth progress circle fills
- Confetti on stamp collection
- Floating elements with CSS keyframes

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on small screens
- Touch-friendly interactions
- Optimized layouts for all screen sizes

## 📸 Screenshots

- **Landing Page**: Animated Asia map with glowing pins
- **Dashboard**: Interactive map with sidebar progress tracker
- **Country Pages**: Dual-tab interface (Learn vs Progress)
- **Lessons**: Rich content with images and quizzes
- **Passport**: 3D flipbook with visa stamps

## 🚀 Deployment

Ready to deploy to Vercel:

```bash
npm run build
```

The app is optimized for production with:
- Static generation where possible
- Dynamic imports for heavy components
- Optimized images and assets

## 📝 License

This project is built as a portfolio/demo project.

## 🎉 Credits

Built with love and cat paws 🐾

---

**Meowtimap** - Your journey through Asian culture starts here! 🗺️✨

