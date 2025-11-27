# 🚀 Meowtimap Quick Start Guide

## Welcome to Meowtimap! 🐾

This guide will help you get started with exploring Asian cultures through our beautiful gamified platform.

## 🎯 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🗺️ Navigation Guide

### Landing Page (/)
- View the beautiful animated Asia map
- Click **"Begin Your Journey"** to start

### Dashboard (/dashboard)
- See all 10 countries on an interactive map
- Click any glowing pin to see country details
- Use the sidebar to track your progress
- Click **"Explore [Country]"** to dive deeper

### Country Pages
Each country has:
- 8 cultural topics to explore
- A progress tracker showing your completion
- Collected stamps in the "My Progress" tab
- Locked topics that unlock as you learn

### Learning & Earning Stamps
1. Choose an unlocked topic (colorful cards)
2. Read the educational content
3. Take the 4-question quiz
4. Score 70% or higher
5. Enjoy the confetti celebration! 🎉
6. Claim your stamp

### Your Passport (/passport)
- View all your collected stamps
- Flip through pages like a real passport
- See empty slots for future adventures
- Access anytime from the top navigation

## 🎨 Tips & Tricks

### 🌓 Dark Mode
Click the moon/sun icon in the top-right navbar to toggle themes

### 🐾 Cat Paw Easter Eggs
Look for animated cat paws throughout the experience - they're everywhere!

### 💫 Hover Effects
Hover over stamps in your progress to trigger mini confetti celebrations

### 📱 Mobile Experience
The sidebar collapses automatically on mobile - use the arrow button to toggle it

## 📚 Available Content

### ✅ Complete Lessons (Ready to Learn!)
1. **Japan - Sushi Culture** 🍣
   - Learn about nigiri, omakase, and becoming an itamae
   - `/learn/japan/sushi-culture`

2. **South Korea - K-Pop History** 🎤
   - Explore the rise of K-Pop and the Hallyu wave
   - `/learn/south-korea/k-pop-history`

3. **Thailand - Songkran Festival** 💦
   - Discover Thailand's epic water festival
   - `/learn/thailand/songkran-festival`

### 🔓 Unlocked Topics (No Lesson Content Yet)
Check the country pages for more unlocked topics across all 10 countries!

### 🔒 Locked Topics
Complete more lessons to unlock additional topics in each country

## 🌏 Country Overview

| Country | Progress | Stamps | Topics Unlocked |
|---------|----------|---------|-----------------|
| 🇸🇬 Singapore | 88% | 2 | 7/8 |
| 🇯🇵 Japan | 78% | 2 | 5/8 |
| 🇰🇷 South Korea | 65% | 1 | 4/8 |
| 🇹🇭 Thailand | 58% | 1 | 4/8 |
| 🇮🇳 India | 52% | 2 | 4/8 |
| 🇲🇾 Malaysia | 45% | 1 | 3/8 |
| 🇨🇳 China | 42% | 1 | 3/8 |
| 🇻🇳 Vietnam | 35% | 1 | 2/8 |
| 🇮🇩 Indonesia | 28% | 1 | 2/8 |
| 🇵🇭 Philippines | 22% | 0 | 1/8 |

**Total Progress: 12/48 stamps collected** 🎯

## 🎓 Learning Path Suggestions

### Beginner Path
1. Start with **Japan - Sushi Culture** (easy, food-focused)
2. Move to **Thailand - Songkran Festival** (fun, festival-focused)
3. Try **South Korea - K-Pop History** (pop culture)

### Cultural Deep Dive
Explore each country's page to see:
- Food traditions
- Festival celebrations
- Language basics
- Historical landmarks
- Pop culture phenomena
- Traditional etiquette

## 🎨 Design Features

### Colors You'll See
- **Soft Blue (#A8BEDF)**: Primary buttons and accents
- **Light Lavender (#C7D5E8)**: Secondary elements
- **Warm Cream (#EFE4D4)**: Highlights and accents
- **Beige Taupe (#D8C9BA)**: Neutral backgrounds

### Special Effects
- ✨ Glassmorphism (frosted glass cards)
- 🎆 Confetti celebrations
- 🌊 Smooth gradient backgrounds
- 🎭 Framer Motion animations
- 📊 Animated progress circles
- 🗺️ Interactive SVG maps

## 🛠️ For Developers

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Canvas Confetti
- Lucide React Icons

### Key Files
- `/lib/mock-data.ts` - All country, topic, and lesson data
- `/lib/types.ts` - TypeScript interfaces
- `/app/globals.css` - Custom animations and styles
- `/tailwind.config.ts` - Color palette configuration

### Adding New Lessons
Edit `/lib/mock-data.ts` and add to the `lessons` object:
```typescript
'country-topic': {
  id: 'country-topic',
  countrySlug: 'country',
  topicSlug: 'topic',
  title: 'Your Lesson Title',
  sections: [ /* 4 sections */ ],
  quiz: [ /* 4 questions */ ]
}
```

### Modifying Colors
Update `tailwind.config.ts` to change the color palette

## 📱 Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel
The project is ready for one-click deployment to Vercel!

## 💡 Pro Tips

1. **Explore Every Country**: Each has unique content and fun facts
2. **Read Carefully**: Quiz questions are based on the lesson content
3. **Collect All Stamps**: Try to get all 48 stamps across Asia
4. **Use the Passport**: Check your progress in the beautiful flipbook
5. **Try Dark Mode**: The glassmorphism looks amazing in both themes

## 🐱 The "Meow" in Meowtimap

The playful cat theme represents:
- 🐾 **Curiosity**: Like a cat, be curious about new cultures
- 🎯 **Playfulness**: Learning should be fun and engaging
- ✨ **Grace**: Appreciate the beauty of Asian traditions
- 🗺️ **Exploration**: Venture into new cultural territories

## 📞 Need Help?

- Check `PROJECT_STRUCTURE.md` for detailed page information
- Read `README.md` for technical details
- Review the code - it's well-commented!

---

## 🎉 Ready to Explore!

Your journey through Asian culture begins now. Click "Begin Your Journey" and start collecting those stamps! 

**Current User**: Yin Jia  
**Starting Stamps**: 12/48  
**Countries to Explore**: 10  
**Lessons Available**: 3 complete (with more unlockable!)

🐾 Happy exploring! 🗺️✨
