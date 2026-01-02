"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
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
  Check
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

  // Close on click outside
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
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all"
      >
        <span className="font-medium text-gray-200">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/10 transition-colors text-sm"
              >
                <span className={opt.value === value ? "text-primary font-semibold" : "text-gray-300"}>
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

  // --- CHART DATA HELPERS ---
  const getFirstImpressionChartData = useMemo(() => {
    if (!summary) return [];
    return summary.firstImpression.map(item => {
      const option = FIRST_IMPRESSION_OPTIONS.find(o => o.value === item._id);
      return {
        label: option?.label || item._id,
        count: item.count,
        color: option?.color || "#9CA3AF"
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
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${
        feedbackSubTab === id
          ? "text-primary border-b-2 border-primary bg-primary/5"
          : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const QuestionCard = ({ title, icon: Icon, children, index }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm"
    >
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-white/10 text-xs font-bold px-2 py-1 rounded text-gray-400">Q{index}</span>
          <h3 className="font-semibold text-lg text-gray-200">{title}</h3>
        </div>
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );

  const currentResponse = responses[selectedResponseIndex];

  // Options for the dropdown
  const questionOptions = [
    { value: "impression", label: "1. First Impression" },
    { value: "ease", label: "2. Ease of Use" },
    { value: "issues", label: "3. Technical Issues" },
    { value: "recommend", label: "4. Recommendation" },
    { value: "feedback", label: "5. Written Feedback" },
  ];

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      
      {/* --- SUB NAVIGATION --- */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-4 pb-2 border-b border-white/10 mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-2xl font-bold">Feedback Analysis</h2>
          <span className="text-sm text-gray-500">{summary?.total || 0} responses</span>
        </div>
        <div className="flex space-x-2">
          <TabButton id="summary" label="Summary" />
          <TabButton id="question" label="By Question" />
          <TabButton id="individual" label="Individual" />
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
               <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl">
                 <p className="text-blue-400 text-sm font-semibold uppercase">Total Responses</p>
                 <p className="text-4xl font-bold text-white mt-2">{summary.total}</p>
               </div>
               <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-xl">
                 <p className="text-green-400 text-sm font-semibold uppercase">Avg Ease of Use</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-white">{summary.avgEaseOfUse.toFixed(1)}</p>
                   <span className="text-white/40">/ 5</span>
                 </div>
               </div>
               <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-xl">
                 <p className="text-purple-400 text-sm font-semibold uppercase">Recommendation</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-white">{summary.avgRecommendation.toFixed(1)}</p>
                   <span className="text-white/40">/ 5</span>
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
                  <div key={i} className="bg-black/20 p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      {r.userId.avatar ? (
                        <img src={r.userId.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                          {r.userId.displayName?.[0] || "?"}
                        </div>
                      )}
                      <span className="text-xs text-gray-400 font-medium">{r.userId.displayName}</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">"{r.additionalFeedback}"</p>
                  </div>
                ))}
                {responses.filter(r => r.additionalFeedback).length === 0 && (
                   <div className="text-center py-8 text-gray-500">No written feedback provided yet.</div>
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
            <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center justify-between">
               <button 
                  onClick={() => setSelectedResponseIndex(Math.max(0, selectedResponseIndex - 1))}
                  disabled={selectedResponseIndex === 0}
                  className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <span className="text-sm font-mono font-medium">
                 {selectedResponseIndex + 1} of {responses.length}
               </span>
               <button 
                  onClick={() => setSelectedResponseIndex(Math.min(responses.length - 1, selectedResponseIndex + 1))}
                  disabled={selectedResponseIndex === responses.length - 1}
                  className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    {currentResponse.userId.avatar ? (
                      <img src={currentResponse.userId.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {currentResponse.userId.displayName?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentResponse.userId.displayName}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Mail className="w-3 h-3" />
                        {currentResponse.userId.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(currentResponse.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  { q: "1. First Impression", a: currentResponse.firstImpression, type: "badge" },
                  { q: "2. Ease of Use", a: `${currentResponse.easeOfUse} / 5`, type: "rating" },
                  { q: "3. Issues Encountered", a: (currentResponse.issues || []).join(", ") || "None", type: "text" },
                  { q: "4. Likelihood to Recommend", a: `${currentResponse.recommendation} / 5`, type: "rating" },
                  { q: "5. Additional Feedback", a: currentResponse.additionalFeedback || "No answer", type: "long-text" },
                  { q: "6. Referred By", a: currentResponse.referral || "Organic", type: "text" }
                ].map((item, i) => (
                  <div key={i} className="p-6 hover:bg-white/5 transition-colors">
                    <p className="text-xs uppercase text-gray-500 font-bold mb-2">{item.q}</p>
                    <div className={`text-lg ${item.type === 'long-text' && !item.a ? 'text-gray-500 italic' : 'text-gray-200'}`}>
                      {item.type === 'badge' ? (
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-base font-medium border border-blue-500/30">
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

        {/* === QUESTION VIEW (FIXED) === */}
        {feedbackSubTab === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Custom Dropdown (No native select to avoid cursor issues) */}
            <div className="glass-strong p-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400 min-w-fit">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter by:</span>
              </div>
              <CustomSelect 
                options={questionOptions} 
                value={selectedQuestion} 
                onChange={setSelectedQuestion} 
              />
            </div>

            {/* Answer List */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
               <div className="p-4 bg-white/5 border-b border-white/10 text-sm text-gray-400 flex justify-between items-center">
                 <span>Showing responses for <strong>{questionOptions.find(o => o.value === selectedQuestion)?.label}</strong></span>
                 <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{responses.length} total</span>
               </div>
               
               <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                 {responses.map((r, i) => {
                   let answer: any = "";
                   
                   // Safe Data Access
                   try {
                     if (selectedQuestion === "impression") answer = r.firstImpression;
                     if (selectedQuestion === "ease") answer = `${r.easeOfUse} / 5`;
                     if (selectedQuestion === "issues") answer = (r.issues || []).join(", ") || "None";
                     if (selectedQuestion === "recommend") answer = `${r.recommendation} / 5`;
                     if (selectedQuestion === "feedback") answer = r.additionalFeedback;
                   } catch (e) {
                     answer = "Error reading data";
                   }

                   // Filter out empty feedback if that's the selected view
                   if (selectedQuestion === "feedback" && !answer) return null;

                   return (
                     <div key={i} className="p-4 flex items-start gap-4 hover:bg-white/5 transition-colors group">
                       <div className="mt-1 flex-shrink-0">
                         {r.userId.avatar ? (
                            <img src={r.userId.avatar} className="w-8 h-8 rounded-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                         ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                              {r.userId.displayName?.[0] || "?"}
                            </div>
                         )}
                       </div>
                       <div className="flex-grow">
                         <div className="text-gray-200 text-base leading-snug">{answer || <span className="text-gray-600 italic">No answer</span>}</div>
                         <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                            <span className="font-medium text-gray-400">{r.userId.displayName}</span>
                            <span>•</span>
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                         </div>
                       </div>
                     </div>
                   )
                 })}
                 
                 {/* Empty State for Feedback */}
                 {selectedQuestion === "feedback" && responses.filter(r => r.additionalFeedback).length === 0 && (
                   <div className="p-8 text-center text-gray-500 italic">
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