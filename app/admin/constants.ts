export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.meowtimap.smoltako.space";

export const FIRST_IMPRESSION_OPTIONS = [
  { value: "learning", label: "Learning about Asian countries", color: "#3B82F6" },
  { value: "planning", label: "Planning a trip to Asia", color: "#10B981" },
  { value: "games", label: "Playing travel-themed games", color: "#F59E0B" },
  { value: "not-sure", label: "I'm not really sure", color: "#6B7280" },
  { value: "other", label: "Other", color: "#8B5CF6" },
];

export const ISSUE_OPTIONS = [
  { value: "none", label: "No issues (Clean Run)", color: "#10B981" },
  { value: "slow", label: "Slowness / Lag", color: "#F59E0B" },
  { value: "loading", label: "Loading Failure", color: "#EF4444" },
  { value: "sound", label: "Audio Issues", color: "#3B82F6" },
  { value: "button", label: "Broken Links/Buttons", color: "#8B5CF6" },
  { value: "other", label: "Other", color: "#EC4899" },
];

export const EASE_EMOJIS = [
  { value: 1, emoji: "😵", label: "Super confusing", color: "#EF4444" },
  { value: 2, emoji: "🤔", label: "A bit tricky", color: "#F59E0B" },
  { value: 3, emoji: "😐", label: "Okay", color: "#efe4d4" },
  { value: 4, emoji: "🙂", label: "Pretty easy", color: "#c7d5e8" },
  { value: 5, emoji: "😊", label: "Super easy!", color: "#a8bedf" },
];

export const RECOMMEND_EMOJIS = [
  { value: 1, emoji: "👎", label: "Probably not", color: "#EF4444" },
  { value: 2, emoji: "🤷", label: "Maybe", color: "#F59E0B" },
  { value: 3, emoji: "😐", label: "Not sure", color: "#efe4d4" },
  { value: 4, emoji: "👍", label: "Likely", color: "#c7d5e8" },
  { value: 5, emoji: "💯", label: "Definitely!", color: "#a8bedf" },
];

export const REFERRAL_OPTIONS = [
  "Sek Yin Jia",
  "Foo Jia Qian",
  "Cheah Chio Yuen",
  "Errol Tay Lee Han",
  "Lee Chang Xin",
];

export const DURATION_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "End of This Year", days: null, isEndOfYear: true },
  { label: "1 Year", days: 365 },
];
