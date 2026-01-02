"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  TrendingUp,
  PieChart,
  AlertTriangle,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Filter,
  ChevronDown,
  Check,
  User,
  Activity
} from "lucide-react";
import { DonutChart, RatingHistogram, HorizontalBarChart } from "./charts";
import { FeedbackSummary, FeedbackResponse, FeedbackSubTab } from "../types";
import {
  FIRST_IMPRESSION_OPTIONS,
  ISSUE_OPTIONS,
  EASE_EMOJIS,
  RECOMMEND_EMOJIS,
} from "../constants";

interface FeedbackTabProps {
  summary: FeedbackSummary | null;
  responses: FeedbackResponse[];
}

// --- HELPER FOR CUSTOM DROPDOWN ---
const CustomSelect = ({ 
  options, 
  value, 
  onChange 
}: { 
  options: { value: string; label: string }[]; 
  value: string; 
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="relative w-full md:w-64" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-card hover:bg-muted/50 border border-input rounded-xl px-4 py-3 transition-all shadow-sm"
      >
        <span className="font-medium text-foreground">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl overflow-hidden z-50 shadow-xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors text-sm"
              >
                <span className={opt.value === value ? "text-primary font-semibold" : "text-popover-foreground"}>
                  {opt.label}
                </span>
                {opt.value === value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FeedbackTab({ summary, responses }: FeedbackTabProps) {
  const [feedbackSubTab, setFeedbackSubTab] = useState<FeedbackSubTab>("summary");
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("impression");

  // --- CHART DATA HELPERS (Updated Colors) ---
  const getFirstImpressionChartData = useMemo(() => {
    if (!summary) return [];
    // Using CSS variable colors for charts would be ideal, but here we fallback to hex codes 
    // that match the 'meow' theme defined in global css (#a8bedf, #c7d5e8, etc)
    const THEME_COLORS = ["#a8bedf", "#c7d5e8", "#efe4d4", "#d8c9ba"];
    
    return summary.firstImpression.map((item, index) => {
      const option = FIRST_IMPRESSION_OPTIONS.find(o => o.value === item._id);
      return {
        label: option?.label || item._id,
        count: item.count,
        color: option?.color || THEME_COLORS[index % THEME_COLORS.length]
      };
    });
  }, [summary]);

  const getIssuesChartData = useMemo(() => {
    if (!summary) return { data: [], max: 0 };
    const processed = summary.issues.map(item => ({
      label: ISSUE_OPTIONS.find(o => o.value === item._id)?.label || item._id,
      value: item._id,
      count: item.count
    }));
    processed.sort((a, b) => {
      if (a.value === 'none') return -1;
      if (b.value === 'none') return 1;
      return b.count - a.count;
    });
    const max = Math.max(...processed.map(i => i.count), 1);
    return { data: processed, max };
  }, [summary]);

  const getReferralChartData = useMemo(() => {
    if (!summary) return { data: [], max: 0 };
    const processed = summary.referral.map(item => ({
      label: item._id,
      value: item._id,
      count: item.count
    }));
    processed.sort((a, b) => b.count - a.count);
    const max = Math.max(...processed.map(i => i.count), 1);
    return { data: processed, max };
  }, [summary]);

  // --- SUB-COMPONENTS ---
  const TabButton = ({ id, label }: { id: FeedbackSubTab; label: string }) => (
    <button
      onClick={() => setFeedbackSubTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
        feedbackSubTab === id
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
      }`}
    >
      {label}
    </button>
  );

  const QuestionCard = ({ title, icon: Icon, children, index }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">Q{index}</span>
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        </div>
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );

  const currentResponse = responses[selectedResponseIndex];

  const questionOptions = [
    { value: "impression", label: "1. First Impression" },
    { value: "ease", label: "2. Ease of Use" },
    { value: "issues", label: "3. Technical Issues" },
    { value: "recommend", label: "4. Recommendation" },
    { value: "feedback", label: "5. Written Feedback" },
  ];

  return (
    <div className="max-w-5xl mx-auto min-h-screen pb-20 px-4">
      
      {/* --- SUB NAVIGATION --- */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-6 pb-4 border-b border-border mb-8 -mx-4 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Feedback Analysis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzing <span className="text-foreground font-semibold">{summary?.total || 0}</span> total responses
            </p>
          </div>
          <div className="bg-muted/30 p-1 rounded-full flex gap-1 border border-border/50">
            <TabButton id="summary" label="Summary" />
            <TabButton id="question" label="By Question" />
            <TabButton id="individual" label="Individual" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* === SUMMARY VIEW === */}
        {feedbackSubTab === "summary" && summary && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
               <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-20 h-20 text-primary" />
                 </div>
                 <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Responses</p>
                 <p className="text-4xl font-bold text-primary mt-2">{summary.total}</p>
               </div>
               
               <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ThumbsUp className="w-20 h-20 text-secondary" />
                 </div>
                 <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Avg Ease of Use</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-secondary">{summary.avgEaseOfUse.toFixed(1)}</p>
                   <span className="text-muted-foreground text-lg">/ 5</span>
                 </div>
               </div>
               
               <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp className="w-20 h-20 text-accent" />
                 </div>
                 <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Recommendation</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-accent-foreground dark:text-accent">{summary.avgRecommendation.toFixed(1)}</p>
                   <span className="text-muted-foreground text-lg">/ 5</span>
                 </div>
               </div>
            </div>

            <QuestionCard index={1} title="First Impressions" icon={PieChart}>
              <DonutChart data={getFirstImpressionChartData} total={summary.total} />
            </QuestionCard>

            <QuestionCard index={2} title="Ease of Use" icon={ThumbsUp}>
              <RatingHistogram data={summary.easeOfUse} total={summary.total} emojiMap={EASE_EMOJIS} />
            </QuestionCard>

            <QuestionCard index={3} title="Technical Issues Encountered" icon={AlertTriangle}>
              <HorizontalBarChart 
                data={getIssuesChartData.data} 
                total={summary.total} 
                maxVal={getIssuesChartData.max} 
                colorMap={ISSUE_OPTIONS} 
              />
            </QuestionCard>

            <QuestionCard index={4} title="Likelihood to Recommend" icon={TrendingUp}>
              <RatingHistogram data={summary.recommendation} total={summary.total} emojiMap={RECOMMEND_EMOJIS} />
            </QuestionCard>

            <QuestionCard index={5} title="Additional Feedback" icon={MessageSquare}>
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {responses.filter(r => r.additionalFeedback).map((r, i) => (
                  <div key={i} className="bg-muted/30 p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      {r.userId.avatar ? (
                        <img src={r.userId.avatar} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-background" />
                      ) : (
                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                          {r.userId.displayName?.[0] || "?"}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground font-medium">{r.userId.displayName}</span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">"{r.additionalFeedback}"</p>
                  </div>
                ))}
                {responses.filter(r => r.additionalFeedback).length === 0 && (
                   <div className="text-center py-8 text-muted-foreground italic">No written feedback provided yet.</div>
                )}
              </div>
            </QuestionCard>

            <QuestionCard index={6} title="Referral Leaderboard" icon={Award}>
              <HorizontalBarChart 
                data={getReferralChartData.data} 
                total={summary.total} 
                maxVal={getReferralChartData.max}
              />
            </QuestionCard>
          </motion.div>
        )}

        {/* === INDIVIDUAL VIEW === */}
        {feedbackSubTab === "individual" && responses.length > 0 && (
          <motion.div
            key="individual"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="glass p-2 rounded-xl flex items-center justify-between sticky top-32 z-20">
               <button 
                  onClick={() => setSelectedResponseIndex(Math.max(0, selectedResponseIndex - 1))}
                  disabled={selectedResponseIndex === 0}
                  className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <span className="text-sm font-mono font-medium text-foreground">
                 {selectedResponseIndex + 1} / {responses.length}
               </span>
               <button 
                  onClick={() => setSelectedResponseIndex(Math.min(responses.length - 1, selectedResponseIndex + 1))}
                  disabled={selectedResponseIndex === responses.length - 1}
                  className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 disabled:hover:bg-transparent text-foreground transition-colors"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>

            <div className="glass-strong rounded-2xl overflow-hidden">
              <div className="p-8 border-b border-border bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-5">
                    {currentResponse.userId.avatar ? (
                      <img src={currentResponse.userId.avatar} alt="" className="w-20 h-20 rounded-full border-4 border-background shadow-md object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-md">
                        {currentResponse.userId.displayName?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{currentResponse.userId.displayName}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="w-3 h-3" />
                        {currentResponse.userId.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(currentResponse.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="divide-y divide-border">
                {[
                  { q: "1. First Impression", a: currentResponse.firstImpression, type: "badge" },
                  { q: "2. Ease of Use", a: `${currentResponse.easeOfUse} / 5`, type: "rating" },
                  { q: "3. Issues Encountered", a: (currentResponse.issues || []).join(", ") || "None", type: "text" },
                  { q: "4. Likelihood to Recommend", a: `${currentResponse.recommendation} / 5`, type: "rating" },
                  { q: "5. Additional Feedback", a: currentResponse.additionalFeedback || "No answer", type: "long-text" },
                  { q: "6. Referred By", a: currentResponse.referral || "Organic", type: "text" }
                ].map((item, i) => (
                  <div key={i} className="p-6 hover:bg-muted/20 transition-colors">
                    <p className="text-xs uppercase text-muted-foreground font-bold mb-2 tracking-wide">{item.q}</p>
                    <div className={`text-lg ${item.type === 'long-text' && !item.a ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                      {item.type === 'badge' ? (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-base font-medium border border-primary/20">
                          {item.a}
                        </span>
                      ) : item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* === QUESTION VIEW === */}
        {feedbackSubTab === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Custom Dropdown */}
            <div className="glass-strong p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground min-w-fit">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter by question:</span>
              </div>
              <CustomSelect 
                options={questionOptions} 
                value={selectedQuestion} 
                onChange={setSelectedQuestion} 
              />
            </div>

            {/* Answer List */}
            <div className="glass-strong rounded-2xl overflow-hidden border border-border">
               <div className="p-4 bg-muted/20 border-b border-border text-sm text-muted-foreground flex justify-between items-center">
                 <span>Showing responses for <strong>{questionOptions.find(o => o.value === selectedQuestion)?.label}</strong></span>
                 <span className="bg-background px-2 py-0.5 rounded-md border border-border text-xs font-mono">{responses.length} total</span>
               </div>
               
               <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                 {responses.map((r, i) => {
                   let answer: any = "";
                   try {
                     if (selectedQuestion === "impression") answer = r.firstImpression;
                     if (selectedQuestion === "ease") answer = `${r.easeOfUse} / 5`;
                     if (selectedQuestion === "issues") answer = (r.issues || []).join(", ") || "None";
                     if (selectedQuestion === "recommend") answer = `${r.recommendation} / 5`;
                     if (selectedQuestion === "feedback") answer = r.additionalFeedback;
                   } catch (e) {
                     answer = "Error reading data";
                   }

                   if (selectedQuestion === "feedback" && !answer) return null;

                   return (
                     <div key={i} className="p-4 flex items-start gap-4 hover:bg-muted/10 transition-colors group">
                       <div className="mt-1 flex-shrink-0">
                         {r.userId.avatar ? (
                            <img src={r.userId.avatar} className="w-9 h-9 rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity ring-1 ring-border" />
                         ) : (
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {r.userId.displayName?.[0] || "?"}
                            </div>
                         )}
                       </div>
                       <div className="flex-grow">
                         <div className="text-foreground text-base leading-snug">{answer || <span className="text-muted-foreground italic">No answer</span>}</div>
                         <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                            <span className="font-medium">{r.userId.displayName}</span>
                            <span>•</span>
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                         </div>
                       </div>
                     </div>
                   )
                 })}
                 
                 {selectedQuestion === "feedback" && responses.filter(r => r.additionalFeedback).length === 0 && (
                   <div className="p-8 text-center text-muted-foreground italic">
                     No written feedback found for this question.
                   </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}