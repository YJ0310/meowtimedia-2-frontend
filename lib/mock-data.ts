import { User, Country, Topic, Stamp, Lesson } from './types';

export const mockUser: User = {
  name: "Aldof Hitler",
  email: "yinjia@nazi.german",
  image: "https://cdn.britannica.com/58/129958-050-C0EF01A4/Adolf-Hitler-1933.jpg?w=400&h=300&c=crop",
  totalStamps: 12
};

export const countries: Country[] = [
  {
    id: '1',
    name: 'Japan',
    slug: 'japan',
    flag: '🇯🇵',
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
    flag: '🇰🇷',
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
    progress: 42,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 3,
    description: 'Ancient civilization with 5,000 years of rich history and cultural treasures.',
    funFact: 'The Great Wall of China is over 13,000 miles long!'
  },
  {
    id: '4',
    name: 'Thailand',
    slug: 'thailand',
    flag: '🇹🇭',
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
    progress: 35,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 2,
    description: 'Beautiful country with stunning natural landscapes and a rich coffee culture.',
    funFact: 'Vietnam is the world\'s largest exporter of cashew nuts!'
  },
  {
    id: '6',
    name: 'Indonesia',
    slug: 'indonesia',
    flag: '🇮🇩',
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
    flag: '🇲🇾',
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
    progress: 22,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 1,
    description: 'Pearl of the Orient Seas with stunning beaches and friendly people.',
    funFact: 'The Philippines has over 7,600 islands with only 2,000 inhabited!'
  },
  {
    id: '9',
    name: 'Singapore',
    slug: 'singapore',
    flag: '🇸🇬',
    coordinates: [103.8198, 1.3521],
    progress: 88,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 7,
    description: 'Gleaming city-state where East meets West in perfect harmony.',
    funFact: 'Singapore has its own unique language - Singlish!'
  },
  {
    id: '10',
    name: 'India',
    slug: 'india',
    flag: '🇮🇳',
    coordinates: [78.9629, 20.5937],
    progress: 52,
    isUnlocked: true,
    totalTopics: 8,
    unlockedTopics: 4,
    description: 'Vibrant subcontinent with ancient wisdom, colorful festivals, and diverse cultures.',
    funFact: 'India has 22 officially recognized languages and over 19,500 dialects!'
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
  { id: '1', countrySlug: 'japan', topicSlug: 'sushi-culture', countryName: 'Japan', topicName: 'Sushi Culture', date: '2024-11-15', icon: '🍣' },
  { id: '2', countrySlug: 'japan', topicSlug: 'festivals', countryName: 'Japan', topicName: 'Traditional Festivals', date: '2024-11-18', icon: '🎌' },
  { id: '3', countrySlug: 'south-korea', topicSlug: 'k-pop-history', countryName: 'South Korea', topicName: 'K-Pop History', date: '2024-11-20', icon: '🎤' },
  { id: '4', countrySlug: 'thailand', topicSlug: 'songkran-festival', countryName: 'Thailand', topicName: 'Songkran Festival', date: '2024-11-22', icon: '💦' },
  { id: '5', countrySlug: 'singapore', topicSlug: 'hawker', countryName: 'Singapore', topicName: 'Hawker Centers', date: '2024-11-23', icon: '🍜' },
  { id: '6', countrySlug: 'singapore', topicSlug: 'gardens', countryName: 'Singapore', topicName: 'Gardens by the Bay', date: '2024-11-24', icon: '🌳' },
  { id: '7', countrySlug: 'india', topicSlug: 'taj-mahal', countryName: 'India', topicName: 'Taj Mahal', date: '2024-11-25', icon: '🕌' },
  { id: '8', countrySlug: 'india', topicSlug: 'holi', countryName: 'India', topicName: 'Holi Festival', date: '2024-11-25', icon: '🎨' },
  { id: '9', countrySlug: 'malaysia', topicSlug: 'nasi-lemak', countryName: 'Malaysia', topicName: 'Nasi Lemak', date: '2024-11-26', icon: '🍚' },
  { id: '10', countrySlug: 'china', topicSlug: 'great-wall', countryName: 'China', topicName: 'Great Wall', date: '2024-11-26', icon: '🏯' },
  { id: '11', countrySlug: 'vietnam', topicSlug: 'pho', countryName: 'Vietnam', topicName: 'Pho Culture', date: '2024-11-27', icon: '🍲' },
  { id: '12', countrySlug: 'indonesia', topicSlug: 'bali-temples', countryName: 'Indonesia', topicName: 'Bali Temples', date: '2024-11-27', icon: '🛕' }
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
