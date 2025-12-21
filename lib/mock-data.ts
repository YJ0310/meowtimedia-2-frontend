import { User, Country, Topic, Stamp, Lesson, ContentItem, QuizData } from './types';

export const mockUser: User = {
  name: "Aldof Hitler",
  email: "yinjia@nazi.german",
  image: "https://cdn.britannica.com/58/129958-050-C0EF01A4/Adolf-Hitler-1933.jpg",
  totalStamps: 12
};

export const countries: Country[] = [
  {
    id: '1',
    name: 'Japan',
    slug: 'japan',
    flag: '/japan.gif',
    coordinates: [138.2529, 36.2048],
    progress: 78,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 5,
    description: 'Land of the Rising Sun, where ancient traditions blend seamlessly with cutting-edge technology.',
    funFact: 'Japan has more than 6,800 islands!'
  },
  {
    id: '2',
    name: 'South Korea',
    slug: 'south-korea',
    flag: '/south korea.gif',
    coordinates: [127.7669, 35.9078],
    progress: 65,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 4,
    description: 'Dynamic nation famous for K-pop, kimchi, and technological innovation.',
    funFact: 'South Korea has the fastest internet speed in the world!'
  },
  {
    id: '3',
    name: 'China',
    slug: 'china',
    flag: '🇨🇳',
    coordinates: [104.1954, 35.8617],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Ancient civilization with 5,000 years of rich history and cultural treasures.',
    funFact: 'The Great Wall of China is over 13,000 miles long!'
  },
  {
    id: '4',
    name: 'Thailand',
    slug: 'thailand',
    flag: '/thailand.gif',
    coordinates: [100.9925, 15.8700],
    progress: 58,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 4,
    description: 'Land of Smiles, known for stunning temples, delicious cuisine, and warm hospitality.',
    funFact: 'Thailand is the only Southeast Asian country never colonized!'
  },
  {
    id: '5',
    name: 'Vietnam',
    slug: 'vietnam',
    flag: '🇻🇳',
    coordinates: [108.2772, 14.0583],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Beautiful country with stunning natural landscapes and a rich coffee culture.',
    funFact: 'Vietnam is the world\'s largest exporter of cashew nuts!'
  },
  {
    id: '6',
    name: 'Indonesia',
    slug: 'indonesia',
    flag: '/indonesia.gif',
    coordinates: [113.9213, -0.7893],
    progress: 28,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 2,
    description: 'World\'s largest archipelago with incredible biodiversity and cultural diversity.',
    funFact: 'Indonesia has over 17,000 islands and 300 ethnic groups!'
  },
  {
    id: '7',
    name: 'Malaysia',
    slug: 'malaysia',
    flag: '/malaysia.gif',
    coordinates: [101.9758, 4.2105],
    progress: 45,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 3,
    description: 'Multicultural paradise blending Malay, Chinese, and Indian influences.',
    funFact: 'Malaysia has the world\'s oldest tropical rainforest at 130 million years!'
  },
  {
    id: '8',
    name: 'Philippines',
    slug: 'philippines',
    flag: '🇵🇭',
    coordinates: [121.7740, 12.8797],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Pearl of the Orient Seas with stunning beaches and friendly people.',
    funFact: 'The Philippines has over 7,600 islands with only 2,000 inhabited!'
  },
  {
    id: '9',
    name: 'Singapore',
    slug: 'singapore',
    flag: '🇸🇬',
    coordinates: [103.8198, 1.3521],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Gleaming city-state where East meets West in perfect harmony.',
    funFact: 'Singapore has its own unique language - Singlish!'
  },
  {
    id: '10',
    name: 'India',
    slug: 'india',
    flag: '🇮🇳',
    coordinates: [78.9629, 20.5937],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Vibrant subcontinent with ancient wisdom, colorful festivals, and diverse cultures.',
    funFact: 'India has 22 officially recognized languages and over 19,500 dialects!'
  },
  {
    id: '11',
    name: 'Taiwan',
    slug: 'taiwan',
    flag: '🇹🇼',
    coordinates: [120.9605, 23.6978],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Beautiful island known for night markets, bubble tea, and stunning mountain scenery.',
    funFact: 'Taiwan invented bubble tea in the 1980s!'
  },
  {
    id: '12',
    name: 'Brunei',
    slug: 'brunei',
    flag: '🇧🇳',
    coordinates: [114.7277, 4.5353],
    progress: 0,
    isUnlocked: false,
    totalTopics: 8,
    unlockedTopics: 0,
    description: 'Tiny wealthy nation on Borneo island with grand mosques and rainforests.',
    funFact: 'Brunei has one of the world\'s largest royal palaces with 1,788 rooms!'
  }
];

export const topics: Topic[] = [
  // Japan topics
  { id: '1', countrySlug: 'japan', name: 'Sushi Culture', slug: 'sushi-culture', icon: '🍣', isUnlocked: true, description: 'Discover the art and history of Japan\'s most famous cuisine' },
  { id: '2', countrySlug: 'japan', name: 'Traditional Festivals', slug: 'festivals', icon: '🎌', isUnlocked: true, description: 'Experience the magic of matsuri celebrations' },
  { id: '3', countrySlug: 'japan', name: 'Samurai History', slug: 'samurai', icon: '⚔️', isUnlocked: true, description: 'Journey through the way of the warrior' },
  { id: '4', countrySlug: 'japan', name: 'Tea Ceremony', slug: 'tea-ceremony', icon: '🍵', isUnlocked: true, description: 'Master the serene art of Japanese tea' },
  { id: '5', countrySlug: 'japan', name: 'Anime & Manga', slug: 'anime', icon: '🎌', isUnlocked: true, description: 'Explore Japan\'s pop culture phenomenon' },
  { id: '6', countrySlug: 'japan', name: 'Mount Fuji', slug: 'fuji', icon: '🗻', isUnlocked: false, description: 'Sacred mountain and national symbol' },
  { id: '7', countrySlug: 'japan', name: 'Japanese Language', slug: 'language', icon: '📝', isUnlocked: false, description: 'Learn the basics of hiragana and katakana' },
  { id: '8', countrySlug: 'japan', name: 'Etiquette', slug: 'etiquette', icon: '🙇', isUnlocked: false, description: 'Navigate Japanese social customs' },

  // South Korea topics
  { id: '11', countrySlug: 'south-korea', name: 'K-Pop History', slug: 'k-pop-history', icon: '🎤', isUnlocked: true, description: 'The rise of Korean pop music to global fame' },
  { id: '12', countrySlug: 'south-korea', name: 'Korean BBQ', slug: 'korean-bbq', icon: '🥩', isUnlocked: true, description: 'Master the art of tabletop grilling' },
  { id: '13', countrySlug: 'south-korea', name: 'Hanbok Fashion', slug: 'hanbok', icon: '👘', isUnlocked: true, description: 'Traditional Korean clothing through the ages' },
  { id: '14', countrySlug: 'south-korea', name: 'K-Drama Culture', slug: 'k-drama', icon: '📺', isUnlocked: true, description: 'The Korean wave in television' },
  { id: '15', countrySlug: 'south-korea', name: 'Seoul Landmarks', slug: 'seoul', icon: '🏯', isUnlocked: false, description: 'Iconic sites of the capital city' },
  { id: '16', countrySlug: 'south-korea', name: 'Kimchi Making', slug: 'kimchi', icon: '🥬', isUnlocked: false, description: 'Korea\'s beloved fermented dish' },
  { id: '17', countrySlug: 'south-korea', name: 'Hangul Writing', slug: 'hangul', icon: '✍️', isUnlocked: false, description: 'The scientific Korean alphabet' },
  { id: '18', countrySlug: 'south-korea', name: 'Chuseok Festival', slug: 'chuseok', icon: '🌕', isUnlocked: false, description: 'Korean harvest thanksgiving' },

  // China topics
  { id: '21', countrySlug: 'china', name: 'Great Wall', slug: 'great-wall', icon: '🏯', isUnlocked: true, description: 'Ancient wonder spanning thousands of miles' },
  { id: '22', countrySlug: 'china', name: 'Dim Sum', slug: 'dim-sum', icon: '🥟', isUnlocked: true, description: 'The art of Cantonese small plates' },
  { id: '23', countrySlug: 'china', name: 'Chinese New Year', slug: 'new-year', icon: '🧧', isUnlocked: true, description: 'Spring Festival traditions and celebrations' },
  { id: '24', countrySlug: 'china', name: 'Calligraphy', slug: 'calligraphy', icon: '🖌️', isUnlocked: false, description: 'The beauty of Chinese brush writing' },
  { id: '25', countrySlug: 'china', name: 'Martial Arts', slug: 'martial-arts', icon: '🥋', isUnlocked: false, description: 'Kung fu and ancient fighting styles' },
  { id: '26', countrySlug: 'china', name: 'Forbidden City', slug: 'forbidden-city', icon: '🏛️', isUnlocked: false, description: 'Imperial palace of Chinese emperors' },
  { id: '27', countrySlug: 'china', name: 'Tea Culture', slug: 'tea-culture', icon: '🍵', isUnlocked: false, description: 'The ancient art of Chinese tea' },
  { id: '28', countrySlug: 'china', name: 'Mandarin Basics', slug: 'mandarin', icon: '🗣️', isUnlocked: false, description: 'Essential phrases in Chinese' },

  // Thailand topics
  { id: '31', countrySlug: 'thailand', name: 'Songkran Festival', slug: 'songkran-festival', icon: '💦', isUnlocked: true, description: 'Thai New Year water celebration' },
  { id: '32', countrySlug: 'thailand', name: 'Street Food', slug: 'street-food', icon: '🍜', isUnlocked: true, description: 'Bangkok\'s legendary night markets' },
  { id: '33', countrySlug: 'thailand', name: 'Buddhist Temples', slug: 'temples', icon: '🛕', isUnlocked: true, description: 'Golden wats and sacred sites' },
  { id: '34', countrySlug: 'thailand', name: 'Thai Massage', slug: 'massage', icon: '💆', isUnlocked: true, description: 'Ancient healing traditions' },
  { id: '35', countrySlug: 'thailand', name: 'Muay Thai', slug: 'muay-thai', icon: '🥊', isUnlocked: false, description: 'The art of eight limbs' },
  { id: '36', countrySlug: 'thailand', name: 'Thai Language', slug: 'language', icon: '🗨️', isUnlocked: false, description: 'Tonal language basics' },
  { id: '37', countrySlug: 'thailand', name: 'Island Hopping', slug: 'islands', icon: '🏝️', isUnlocked: false, description: 'Tropical paradise exploration' },
  { id: '38', countrySlug: 'thailand', name: 'Wai Greeting', slug: 'wai', icon: '🙏', isUnlocked: false, description: 'Traditional Thai respect gesture' },

  // Vietnam topics
  { id: '41', countrySlug: 'vietnam', name: 'Pho Culture', slug: 'pho', icon: '🍲', isUnlocked: true, description: 'Vietnam\'s beloved noodle soup' },
  { id: '42', countrySlug: 'vietnam', name: 'Halong Bay', slug: 'halong-bay', icon: '⛵', isUnlocked: true, description: 'Limestone karsts and emerald waters' },
  { id: '43', countrySlug: 'vietnam', name: 'Coffee Culture', slug: 'coffee', icon: '☕', isUnlocked: false, description: 'Vietnamese iced coffee tradition' },
  { id: '44', countrySlug: 'vietnam', name: 'Ao Dai', slug: 'ao-dai', icon: '👗', isUnlocked: false, description: 'Traditional Vietnamese dress' },
  { id: '45', countrySlug: 'vietnam', name: 'Tet Festival', slug: 'tet', icon: '🎆', isUnlocked: false, description: 'Lunar New Year celebrations' },
  { id: '46', countrySlug: 'vietnam', name: 'Water Puppets', slug: 'puppets', icon: '🎭', isUnlocked: false, description: 'Ancient aquatic theater art' },
  { id: '47', countrySlug: 'vietnam', name: 'Vietnamese Language', slug: 'language', icon: '💬', isUnlocked: false, description: 'Learn essential phrases' },
  { id: '48', countrySlug: 'vietnam', name: 'Lantern Festivals', slug: 'lanterns', icon: '🏮', isUnlocked: false, description: 'Hoi An\'s magical lights' },

  // Indonesia topics
  { id: '51', countrySlug: 'indonesia', name: 'Bali Temples', slug: 'bali-temples', icon: '🛕', isUnlocked: true, description: 'Sacred Hindu shrines of the island' },
  { id: '52', countrySlug: 'indonesia', name: 'Nasi Goreng', slug: 'nasi-goreng', icon: '🍛', isUnlocked: true, description: 'Indonesia\'s iconic fried rice' },
  { id: '53', countrySlug: 'indonesia', name: 'Batik Art', slug: 'batik', icon: '🎨', isUnlocked: false, description: 'Traditional wax-resist dyeing' },
  { id: '54', countrySlug: 'indonesia', name: 'Borobudur', slug: 'borobudur', icon: '⛰️', isUnlocked: false, description: 'World\'s largest Buddhist temple' },
  { id: '55', countrySlug: 'indonesia', name: 'Gamelan Music', slug: 'gamelan', icon: '🎶', isUnlocked: false, description: 'Traditional percussion ensemble' },
  { id: '56', countrySlug: 'indonesia', name: 'Indonesian Language', slug: 'language', icon: '🗣️', isUnlocked: false, description: 'Bahasa Indonesia basics' },
  { id: '57', countrySlug: 'indonesia', name: 'Wayang Kulit', slug: 'wayang', icon: '🎭', isUnlocked: false, description: 'Shadow puppet theater' },
  { id: '58', countrySlug: 'indonesia', name: 'Komodo Dragons', slug: 'komodo', icon: '🦎', isUnlocked: false, description: 'Giant lizards of Indonesia' },

  // Malaysia topics
  { id: '61', countrySlug: 'malaysia', name: 'Nasi Lemak', slug: 'nasi-lemak', icon: '🍚', isUnlocked: true, description: 'Malaysia\'s fragrant national dish' },
  { id: '62', countrySlug: 'malaysia', name: 'Petronas Towers', slug: 'petronas', icon: '🏙️', isUnlocked: true, description: 'Iconic twin skyscrapers of KL' },
  { id: '63', countrySlug: 'malaysia', name: 'Multicultural Heritage', slug: 'heritage', icon: '🏮', isUnlocked: true, description: 'Malay, Chinese, and Indian fusion' },
  { id: '64', countrySlug: 'malaysia', name: 'Rainforest Wildlife', slug: 'wildlife', icon: '🐅', isUnlocked: false, description: 'Orangutans and exotic animals' },
  { id: '65', countrySlug: 'malaysia', name: 'Hari Raya', slug: 'hari-raya', icon: '🌙', isUnlocked: false, description: 'Islamic festival celebrations' },
  { id: '66', countrySlug: 'malaysia', name: 'Malaysian Language', slug: 'language', icon: '💭', isUnlocked: false, description: 'Bahasa Malaysia essentials' },
  { id: '67', countrySlug: 'malaysia', name: 'Penang Street Art', slug: 'street-art', icon: '🎨', isUnlocked: false, description: 'Famous murals and heritage' },
  { id: '68', countrySlug: 'malaysia', name: 'Teh Tarik', slug: 'teh-tarik', icon: '🥤', isUnlocked: false, description: 'Pulled milk tea tradition' },

  // Philippines topics
  { id: '71', countrySlug: 'philippines', name: 'Island Paradise', slug: 'islands', icon: '🏖️', isUnlocked: true, description: 'Pristine beaches and crystal waters' },
  { id: '72', countrySlug: 'philippines', name: 'Adobo', slug: 'adobo', icon: '🍖', isUnlocked: false, description: 'The unofficial national dish' },
  { id: '73', countrySlug: 'philippines', name: 'Jeepney Culture', slug: 'jeepney', icon: '🚌', isUnlocked: false, description: 'Colorful public transport icons' },
  { id: '74', countrySlug: 'philippines', name: 'Sinulog Festival', slug: 'sinulog', icon: '💃', isUnlocked: false, description: 'Grand cultural celebration' },
  { id: '75', countrySlug: 'philippines', name: 'Tagalog Basics', slug: 'tagalog', icon: '🗨️', isUnlocked: false, description: 'Learn Filipino language' },
  { id: '76', countrySlug: 'philippines', name: 'Rice Terraces', slug: 'terraces', icon: '🌾', isUnlocked: false, description: 'Ancient carved mountains' },
  { id: '77', countrySlug: 'philippines', name: 'Karaoke Culture', slug: 'karaoke', icon: '🎤', isUnlocked: false, description: 'Filipino love for singing' },
  { id: '78', countrySlug: 'philippines', name: 'Spanish Heritage', slug: 'heritage', icon: '⛪', isUnlocked: false, description: 'Colonial history and influence' },

  // Singapore topics
  { id: '81', countrySlug: 'singapore', name: 'Hawker Centers', slug: 'hawker', icon: '🍜', isUnlocked: true, description: 'Food paradise at every corner' },
  { id: '82', countrySlug: 'singapore', name: 'Gardens by the Bay', slug: 'gardens', icon: '🌳', isUnlocked: true, description: 'Futuristic supertrees and domes' },
  { id: '83', countrySlug: 'singapore', name: 'Singlish', slug: 'singlish', icon: '🗣️', isUnlocked: true, description: 'Unique Singaporean English lah!' },
  { id: '84', countrySlug: 'singapore', name: 'Merlion Legend', slug: 'merlion', icon: '🦁', isUnlocked: true, description: 'National symbol and icon' },
  { id: '85', countrySlug: 'singapore', name: 'Peranakan Culture', slug: 'peranakan', icon: '🏘️', isUnlocked: true, description: 'Straits Chinese heritage' },
  { id: '86', countrySlug: 'singapore', name: 'National Day', slug: 'national-day', icon: '🎆', isUnlocked: true, description: 'Singapore\'s birthday celebration' },
  { id: '87', countrySlug: 'singapore', name: 'Marina Bay', slug: 'marina-bay', icon: '🌃', isUnlocked: true, description: 'Stunning waterfront skyline' },
  { id: '88', countrySlug: 'singapore', name: 'Chilli Crab', slug: 'chilli-crab', icon: '🦀', isUnlocked: false, description: 'Singapore\'s signature seafood' },

  // India topics
  { id: '91', countrySlug: 'india', name: 'Taj Mahal', slug: 'taj-mahal', icon: '🕌', isUnlocked: true, description: 'Monument of eternal love' },
  { id: '92', countrySlug: 'india', name: 'Curry Mastery', slug: 'curry', icon: '🍛', isUnlocked: true, description: 'The art of Indian spices' },
  { id: '93', countrySlug: 'india', name: 'Holi Festival', slug: 'holi', icon: '🎨', isUnlocked: true, description: 'Festival of colors and joy' },
  { id: '94', countrySlug: 'india', name: 'Bollywood', slug: 'bollywood', icon: '🎬', isUnlocked: true, description: 'World\'s largest film industry' },
  { id: '95', countrySlug: 'india', name: 'Yoga Origins', slug: 'yoga', icon: '🧘', isUnlocked: false, description: 'Ancient mind-body practice' },
  { id: '96', countrySlug: 'india', name: 'Hindi Language', slug: 'hindi', icon: '📖', isUnlocked: false, description: 'Learn the script and basics' },
  { id: '97', countrySlug: 'india', name: 'Namaste Etiquette', slug: 'namaste', icon: '🙏', isUnlocked: false, description: 'Traditional greeting culture' },
  { id: '98', countrySlug: 'india', name: 'Diwali Lights', slug: 'diwali', icon: '🪔', isUnlocked: false, description: 'Festival of lights celebration' }
];

export const stamps: Stamp[] = [
  { id: '1', countrySlug: 'japan', topicSlug: 'sushi-culture', countryName: 'Japan', topicName: 'Sushi Culture', date: '2024-11-15', icon: '🍣', stampImage: '/stamp/japan.png', isVisible: true },
  { id: '2', countrySlug: 'japan', topicSlug: 'festivals', countryName: 'Japan', topicName: 'Traditional Festivals', date: '2024-11-18', icon: '🎌', stampImage: '/stamp/japan.png', isVisible: false },
  { id: '3', countrySlug: 'south-korea', topicSlug: 'k-pop-history', countryName: 'South Korea', topicName: 'K-Pop History', date: '2024-11-20', icon: '🎤', stampImage: '/stamp/korea.png', isVisible: false },
  { id: '4', countrySlug: 'thailand', topicSlug: 'songkran-festival', countryName: 'Thailand', topicName: 'Songkran Festival', date: '2024-11-22', icon: '💦', stampImage: '/stamp/thailand.png', isVisible: false },
  { id: '5', countrySlug: 'singapore', topicSlug: 'hawker', countryName: 'Singapore', topicName: 'Hawker Centers', date: '2024-11-23', icon: '🍜', isVisible: false },
  { id: '6', countrySlug: 'singapore', topicSlug: 'gardens', countryName: 'Singapore', topicName: 'Gardens by the Bay', date: '2024-11-24', icon: '🌳', isVisible: false },
  { id: '7', countrySlug: 'india', topicSlug: 'taj-mahal', countryName: 'India', topicName: 'Taj Mahal', date: '2024-11-25', icon: '🕌', isVisible: false },
  { id: '8', countrySlug: 'india', topicSlug: 'holi', countryName: 'India', topicName: 'Holi Festival', date: '2024-11-25', icon: '🎨', isVisible: false },
  { id: '9', countrySlug: 'malaysia', topicSlug: 'nasi-lemak', countryName: 'Malaysia', topicName: 'Nasi Lemak', date: '2024-11-26', icon: '🍚', stampImage: '/stamp/malaysia.png', isVisible: false },
  { id: '10', countrySlug: 'china', topicSlug: 'great-wall', countryName: 'China', topicName: 'Great Wall', date: '2024-11-26', icon: '🏯', isVisible: false },
  { id: '11', countrySlug: 'vietnam', topicSlug: 'pho', countryName: 'Vietnam', topicName: 'Pho Culture', date: '2024-11-27', icon: '🍲', isVisible: false },
  { id: '12', countrySlug: 'indonesia', topicSlug: 'bali-temples', countryName: 'Indonesia', topicName: 'Bali Temples', date: '2024-11-27', icon: '🛕', stampImage: '/stamp/indonesia.png', isVisible: false }
];

export const lessons: { [key: string]: Lesson } = {
  'japan-sushi-culture': {
    id: 'japan-sushi-culture',
    countrySlug: 'japan',
    topicSlug: 'sushi-culture',
    title: 'The Art of Sushi: From Edo to Modern Mastery',
    sections: [
      {
        title: 'Origins of Sushi',
        content: 'Sushi\'s journey began over 1,000 years ago as a preservation method called narezushi, where fish was fermented with rice. The modern sushi we know emerged in Edo period Tokyo (1603-1868) as "fast food" from street vendors. Hanaya Yohei revolutionized sushi in the 1820s by serving fresh fish on vinegared rice, creating nigiri sushi.',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'
      },
      {
        title: 'Types of Sushi',
        content: 'Nigiri features hand-pressed rice topped with fish, while maki are rolled sushi wrapped in nori seaweed. Sashimi is fresh raw fish served without rice. Temaki are hand-rolled cone shapes, and chirashi is scattered sushi served in a bowl. Each style showcases the chef\'s skill and Japan\'s reverence for fresh ingredients.',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800'
      },
      {
        title: 'The Omakase Experience',
        content: 'Omakase ("I\'ll leave it up to you") is the ultimate sushi experience where the chef selects each piece. It\'s a dialogue between chef and diner, showcasing seasonal ingredients at their peak. Proper etiquette includes eating each piece immediately, using fingers or chopsticks, and dipping fish-side down in soy sauce.',
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800'
      },
      {
        title: 'Becoming an Itamae',
        content: 'Sushi chefs (itamae) undergo rigorous training for 10+ years. Apprentices start by observing, then spend years perfecting rice preparation (the soul of sushi), learning knife skills, and understanding fish anatomy. The journey from washing dishes to standing behind the counter requires dedication, precision, and deep respect for the craft.',
        image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800'
      }
    ],
    quiz: [
      {
        question: 'What does "omakase" literally mean?',
        options: ['Fresh fish', 'I\'ll leave it up to you', 'Master chef', 'Rice ball'],
        correctAnswer: 1
      },
      {
        question: 'In which Japanese city did modern nigiri sushi originate?',
        options: ['Osaka', 'Kyoto', 'Edo (Tokyo)', 'Hiroshima'],
        correctAnswer: 2
      },
      {
        question: 'Which part should touch the soy sauce when eating nigiri?',
        options: ['Rice side', 'Fish side', 'Both equally', 'Neither'],
        correctAnswer: 1
      },
      {
        question: 'How long does traditional sushi chef training typically take?',
        options: ['2-3 years', '5-6 years', '10+ years', '1 year'],
        correctAnswer: 2
      }
    ]
  },
  'south-korea-k-pop-history': {
    id: 'south-korea-k-pop-history',
    countrySlug: 'south-korea',
    topicSlug: 'k-pop-history',
    title: 'The Global Rise of K-Pop: From Seoul to the World',
    sections: [
      {
        title: 'The Birth of K-Pop',
        content: 'K-Pop\'s modern era began in 1992 with Seo Taiji and Boys, who fused Korean lyrics with Western genres like rap and rock. This revolutionary approach broke from traditional trot music. The 1990s saw the rise of entertainment companies like SM, YG, and JYP, establishing the intensive training system that defines K-Pop today.',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
      },
      {
        title: 'The Idol Training System',
        content: 'K-Pop idols undergo grueling training for 2-7 years before debut, learning singing, dancing, acting, and foreign languages. Trainees practice 12+ hours daily, living in company dormitories. This system creates polished performers but has faced criticism for intense pressure. The investment ensures K-Pop\'s signature synchronized choreography and versatility.',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
      },
      {
        title: 'Hallyu Wave Goes Global',
        content: 'The Korean Wave (Hallyu) exploded globally in 2012 with PSY\'s "Gangnam Style" reaching 1 billion YouTube views. BTS shattered barriers, topping Billboard charts and speaking at the UN. BLACKPINK became the biggest girl group worldwide. K-Pop\'s success stems from high-quality production, multilingual content, and strategic social media engagement.',
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'
      },
      {
        title: 'Impact on Korean Culture',
        content: 'K-Pop drives billions in economic value through music, fashion, beauty, and tourism. Fans worldwide learn Korean, boosting language apps. The industry promotes Korean fashion trends and makeup styles globally. However, it also faces scrutiny over mental health, dating bans, and extreme beauty standards for performers.',
        image: 'https://images.unsplash.com/photo-1598387846613-8235a1f4d50b?w=800'
      }
    ],
    quiz: [
      {
        question: 'Which group is credited with starting modern K-Pop in 1992?',
        options: ['BTS', 'Seo Taiji and Boys', 'BIGBANG', 'H.O.T'],
        correctAnswer: 1
      },
      {
        question: 'What does "Hallyu" refer to?',
        options: ['Korean dance', 'The Korean Wave', 'A music genre', 'Fan clubs'],
        correctAnswer: 1
      },
      {
        question: 'Which song first brought K-Pop to global mainstream attention in 2012?',
        options: ['Dynamite', 'Gangnam Style', 'Sorry Sorry', 'Fantastic Baby'],
        correctAnswer: 1
      },
      {
        question: 'How long do K-Pop trainees typically train before debut?',
        options: ['6 months', '1 year', '2-7 years', '10 years'],
        correctAnswer: 2
      }
    ]
  },
  'thailand-songkran-festival': {
    id: 'thailand-songkran-festival',
    countrySlug: 'thailand',
    topicSlug: 'songkran-festival',
    title: 'Songkran: Thailand\'s Joyous Water Festival',
    sections: [
      {
        title: 'The Meaning of Songkran',
        content: 'Songkran marks the Thai New Year (April 13-15) based on the Buddhist solar calendar. The name derives from Sanskrit "saṅkrānti" meaning "astrological passage." It\'s a time of renewal, when Thais return home to honor elders, visit temples, and cleanse Buddha images with perfumed water, symbolizing washing away bad luck.',
        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'
      },
      {
        title: 'Traditional Rituals',
        content: 'Songkran begins with morning alms-giving to monks and temple visits. Thais perform "Rod Nam Dum Hua" - younger people pour scented water over elders\' hands as a respect gesture, receiving blessings in return. Families build sand pagodas at temples, symbolizing returning sand carried out on feet throughout the year.',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
      },
      {
        title: 'The Epic Water Fights',
        content: 'What started as gentle water sprinkling evolved into massive street water battles! Armed with water guns, buckets, and hoses, millions engage in friendly warfare. Bangkok\'s Silom Road and Chiang Mai\'s moats become war zones. The water symbolizes purification and good fortune, though today it\'s mostly pure fun!',
        image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800'
      },
      {
        title: 'Regional Celebrations',
        content: 'Each region celebrates uniquely. Chiang Mai hosts week-long festivities with beauty pageants and parades. Pattaya throws massive beach parties. Ayutthaya combines water fun with cultural performances. Isan region features traditional folk music. Despite variations, the spirit of renewal, family, and joy remains universal across Thailand.',
        image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800'
      }
    ],
    quiz: [
      {
        question: 'When is Songkran celebrated?',
        options: ['January 1-3', 'April 13-15', 'December 25-27', 'July 1-3'],
        correctAnswer: 1
      },
      {
        question: 'What does the water used in Songkran symbolize?',
        options: ['Wealth', 'Power', 'Purification and good fortune', 'Friendship'],
        correctAnswer: 2
      },
      {
        question: 'What is "Rod Nam Dum Hua"?',
        options: ['Water gun fight', 'Pouring water over elders\' hands', 'Temple cleaning', 'Sand building'],
        correctAnswer: 1
      },
      {
        question: 'Which city is famous for hosting the longest Songkran celebration?',
        options: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya'],
        correctAnswer: 2
      }
    ]
  }
};

// Content data for countries (festivals, food, funfacts)
export const countryContent: ContentItem[] = [
  // Japan Festivals
  { id: 'jp-fest-1', countrySlug: 'japan', type: 'festival', title: 'Hanami (Cherry Blossom Festival)', content: 'Hanami is the beloved Japanese tradition of enjoying the beauty of cherry blossoms. Every spring, millions gather in parks for picnics under sakura trees, celebrating renewal and the fleeting nature of life.', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800' },
  { id: 'jp-fest-2', countrySlug: 'japan', type: 'festival', title: 'Gion Matsuri', content: 'Held in Kyoto throughout July, Gion Matsuri is one of Japan\'s most famous festivals featuring massive decorated floats (yamaboko) parading through streets, traditional music, and vibrant night markets.', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800' },
  { id: 'jp-fest-3', countrySlug: 'japan', type: 'festival', title: 'Obon Festival', content: 'Obon is a Buddhist event honoring ancestral spirits. Families clean graves, perform Bon Odori dances, and float paper lanterns on rivers to guide spirits back to the afterlife.', image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800' },
  
  // Japan Food
  { id: 'jp-food-1', countrySlug: 'japan', type: 'food', title: 'Ramen', content: 'Japanese ramen features Chinese-style wheat noodles in rich broth - from creamy tonkotsu (pork bone) to soy-based shoyu. Each region has unique styles, with toppings like chashu pork, soft-boiled eggs, and nori.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800' },
  { id: 'jp-food-2', countrySlug: 'japan', type: 'food', title: 'Tempura', content: 'Introduced by Portuguese missionaries in the 16th century, tempura involves lightly battering and frying vegetables and seafood. The secret is a crispy, not greasy, coating achieved through ice-cold batter.', image: 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=800' },
  { id: 'jp-food-3', countrySlug: 'japan', type: 'food', title: 'Wagyu Beef', content: 'Wagyu literally means "Japanese cow." These cattle are raised with special care, sometimes including beer and massages. The intense marbling creates a melt-in-your-mouth texture unlike any other beef.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800' },
  
  // Japan Fun Facts
  { id: 'jp-fact-1', countrySlug: 'japan', type: 'funfact', title: 'Vending Machine Paradise', content: 'Japan has over 5.5 million vending machines - one for every 23 people! You can buy everything from hot ramen and fresh eggs to umbrellas and even cars.', image: 'https://images.unsplash.com/photo-1549210328-65cb9e70b9c2?w=800' },
  { id: 'jp-fact-2', countrySlug: 'japan', type: 'funfact', title: 'No Tipping Culture', content: 'Tipping is not customary in Japan and can even be considered rude. Good service is simply expected as part of the job, not something to be rewarded with extra money.', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800' },

  // South Korea Festivals
  { id: 'kr-fest-1', countrySlug: 'south-korea', type: 'festival', title: 'Seollal (Lunar New Year)', content: 'Korea\'s most important holiday where families gather, perform ancestral rites (charye), play folk games, and eat tteokguk (rice cake soup) to symbolically gain another year of age.', image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800' },
  { id: 'kr-fest-2', countrySlug: 'south-korea', type: 'festival', title: 'Chuseok (Harvest Festival)', content: 'Often called "Korean Thanksgiving," families reunite to share food, visit ancestral graves, and give thanks for the harvest. Traditional foods include songpyeon (rice cakes) and jeon (pancakes).', image: 'https://images.unsplash.com/photo-1580130732478-4e339fb6836f?w=800' },
  { id: 'kr-fest-3', countrySlug: 'south-korea', type: 'festival', title: 'Boryeong Mud Festival', content: 'Every July, the coastal city of Boryeong transforms into a massive mud playground! Millions come to wrestle in mud, slide down mud slides, and enjoy mud-based beauty treatments.', image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=800' },
  
  // South Korea Food
  { id: 'kr-food-1', countrySlug: 'south-korea', type: 'food', title: 'Bibimbap', content: 'This iconic dish means "mixed rice" - a bowl of warm rice topped with sautéed vegetables, gochujang (chili paste), a fried egg, and often sliced meat. Mix it all together for harmony of flavors!', image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800' },
  { id: 'kr-food-2', countrySlug: 'south-korea', type: 'food', title: 'Korean Fried Chicken', content: 'Double-fried for extra crispiness and coated in sweet-spicy sauces, Korean fried chicken (chikin) has taken the world by storm. Best enjoyed with beer (chimaek) while watching K-dramas!', image: 'https://images.unsplash.com/photo-1575932444877-5106bee2a599?w=800' },
  
  // South Korea Fun Facts
  { id: 'kr-fact-1', countrySlug: 'south-korea', type: 'funfact', title: 'Age System', content: 'Koreans use a unique age system where you\'re 1 year old at birth and everyone ages up on New Year\'s Day. You could be up to 2 years "older" in Korean age than in Western age!', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800' },
  { id: 'kr-fact-2', countrySlug: 'south-korea', type: 'funfact', title: 'Number 4 Superstition', content: 'The number 4 sounds like "death" in Korean (and Chinese). Many buildings skip the 4th floor, labeling it "F" instead. You\'ll often see 1, 2, 3, F, 5 in elevators!', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800' },

  // Thailand Festivals
  { id: 'th-fest-1', countrySlug: 'thailand', type: 'festival', title: 'Loy Krathong', content: 'On the full moon of the 12th lunar month, Thais release floating baskets (krathong) decorated with candles, incense, and flowers onto rivers to pay respect to the water goddess and let go of grudges.', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800' },
  { id: 'th-fest-2', countrySlug: 'thailand', type: 'festival', title: 'Yi Peng Lantern Festival', content: 'Coinciding with Loy Krathong in Chiang Mai, thousands of paper lanterns (khom loi) are released into the night sky, creating a breathtaking sea of floating lights symbolizing letting go of misfortune.', image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800' },
  
  // Thailand Food
  { id: 'th-food-1', countrySlug: 'thailand', type: 'food', title: 'Pad Thai', content: 'Thailand\'s most famous noodle dish features stir-fried rice noodles with eggs, tofu, shrimp, peanuts, and tamarind sauce. Created in the 1930s as part of a nation-building campaign to promote Thai identity.', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800' },
  { id: 'th-food-2', countrySlug: 'thailand', type: 'food', title: 'Tom Yum Goong', content: 'This hot and sour shrimp soup is a flavor explosion of lemongrass, galangal, kaffir lime leaves, chili, and fish sauce. It\'s considered one of the world\'s best soups and was nominated for UNESCO recognition.', image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800' },
  { id: 'th-food-3', countrySlug: 'thailand', type: 'food', title: 'Mango Sticky Rice', content: 'Thailand\'s beloved dessert pairs sweet glutinous rice cooked in coconut milk with ripe mango slices. Best enjoyed during mango season (April-June) from street vendors.', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800' },
  
  // Thailand Fun Facts
  { id: 'th-fact-1', countrySlug: 'thailand', type: 'funfact', title: 'Never Colonized', content: 'Thailand is the only Southeast Asian country never colonized by European powers. The name "Thailand" means "Land of the Free" - a source of great national pride.', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800' },

  // Indonesia Festivals
  { id: 'id-fest-1', countrySlug: 'indonesia', type: 'festival', title: 'Nyepi (Day of Silence)', content: 'Bali\'s Hindu New Year is unlike any other - the entire island shuts down for 24 hours. No lights, no work, no travel, no entertainment. Even the airport closes! It\'s a day for self-reflection.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },
  { id: 'id-fest-2', countrySlug: 'indonesia', type: 'festival', title: 'Galungan', content: 'This Balinese festival celebrates the victory of dharma (good) over adharma (evil). Homes and temples are decorated with penjor - tall bamboo poles with offerings. Ancestors are believed to visit for 10 days.', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800' },
  
  // Indonesia Food
  { id: 'id-food-1', countrySlug: 'indonesia', type: 'food', title: 'Rendang', content: 'Voted the world\'s most delicious food by CNN, this West Sumatran dish features beef slow-cooked in coconut milk and spices for hours until the sauce is absorbed. Originally created for preservation and celebrations.', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800' },
  { id: 'id-food-2', countrySlug: 'indonesia', type: 'food', title: 'Satay', content: 'Marinated meat skewers grilled over charcoal and served with peanut sauce. Each region has variations - Madura satay uses sweeter sauce while Padang satay features spicier curry-based sauce.', image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=800' },
  
  // Indonesia Fun Facts
  { id: 'id-fact-1', countrySlug: 'indonesia', type: 'funfact', title: 'Largest Archipelago', content: 'Indonesia spans over 17,000 islands across 5,000 km - wider than the continental United States! Only about 6,000 are inhabited, home to 270+ million people speaking 700+ languages.', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800' },

  // Malaysia Festivals
  { id: 'my-fest-1', countrySlug: 'malaysia', type: 'festival', title: 'Thaipusam', content: 'Hindu devotees honor Lord Murugan through acts of devotion including body piercing with hooks and skewers. The procession to Batu Caves near KL draws over a million participants annually.', image: 'https://images.unsplash.com/photo-1580889272861-b66f10d1d91f?w=800' },
  { id: 'my-fest-2', countrySlug: 'malaysia', type: 'festival', title: 'Hari Raya Aidilfitri', content: 'The biggest celebration for Malaysia\'s Muslim majority marks the end of Ramadan. Families gather for open houses serving ketupat (rice cakes), rendang, and sweets. "Maaf Zahir dan Batin" (forgiveness) is exchanged.', image: 'https://images.unsplash.com/photo-1590091355806-7798e8e63bd6?w=800' },
  
  // Malaysia Food
  { id: 'my-food-1', countrySlug: 'malaysia', type: 'food', title: 'Char Kway Teow', content: 'Smoky stir-fried flat rice noodles with prawns, cockles, Chinese sausage, eggs, and bean sprouts. The "wok hei" (breath of the wok) from high heat is essential for authentic flavor.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800' },
  { id: 'my-food-2', countrySlug: 'malaysia', type: 'food', title: 'Roti Canai', content: 'Flaky, crispy flatbread from Indian-Muslim origin, typically served with dhal curry. Watching the roti maker flip and stretch the dough is entertainment in itself! Best for breakfast.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800' },
  
  // Malaysia Fun Facts
  { id: 'my-fact-1', countrySlug: 'malaysia', type: 'funfact', title: 'Oldest Rainforest', content: 'Taman Negara in Malaysia is one of the world\'s oldest rainforests at 130 million years old - older than the Amazon and Congo! It houses incredible biodiversity including tigers and elephants.', image: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=800' },
];

// Quiz data for countries
export const countryQuizzes: QuizData[] = [
  {
    countrySlug: 'japan',
    highestScore: 8,
    totalQuestions: 10,
    questions: [
      { question: 'What is the capital of Japan?', options: ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], correctAnswer: 2 },
      { question: 'What does "kawaii" mean?', options: ['Strong', 'Cute', 'Fast', 'Smart'], correctAnswer: 1 },
      { question: 'Which mountain is Japan\'s highest?', options: ['Mt. Aso', 'Mt. Fuji', 'Mt. Koya', 'Mt. Tate'], correctAnswer: 1 },
      { question: 'What is origami?', options: ['Paper folding', 'Flower arranging', 'Sword fighting', 'Tea ceremony'], correctAnswer: 0 },
      { question: 'What is the cherry blossom called in Japanese?', options: ['Momiji', 'Sakura', 'Ume', 'Fuji'], correctAnswer: 1 },
    ]
  },
  {
    countrySlug: 'south-korea',
    highestScore: 6,
    totalQuestions: 10,
    questions: [
      { question: 'What is the capital of South Korea?', options: ['Busan', 'Seoul', 'Incheon', 'Daegu'], correctAnswer: 1 },
      { question: 'What is kimchi?', options: ['Rice dish', 'Fermented vegetables', 'Grilled meat', 'Noodle soup'], correctAnswer: 1 },
      { question: 'What is the Korean alphabet called?', options: ['Kanji', 'Hangul', 'Hiragana', 'Mandarin'], correctAnswer: 1 },
    ]
  },
  {
    countrySlug: 'thailand',
    highestScore: 0,
    totalQuestions: 10,
    questions: [
      { question: 'What is the capital of Thailand?', options: ['Chiang Mai', 'Phuket', 'Bangkok', 'Pattaya'], correctAnswer: 2 },
      { question: 'What does "Sawadee" mean?', options: ['Thank you', 'Hello', 'Goodbye', 'Sorry'], correctAnswer: 1 },
    ]
  },
  {
    countrySlug: 'indonesia',
    highestScore: 4,
    totalQuestions: 10,
    questions: [
      { question: 'What is the capital of Indonesia?', options: ['Bali', 'Jakarta', 'Surabaya', 'Yogyakarta'], correctAnswer: 1 },
    ]
  },
  {
    countrySlug: 'malaysia',
    highestScore: 7,
    totalQuestions: 10,
    questions: [
      { question: 'What is Malaysia\'s national dish?', options: ['Pad Thai', 'Nasi Lemak', 'Pho', 'Sushi'], correctAnswer: 1 },
    ]
  },
];
