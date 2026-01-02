"use client";

import { useState, useMemo } from "react";
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
  User,
  Copy,
  Mail,
  Calendar,
  Filter
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

export default function FeedbackTab({ summary, responses }: FeedbackTabProps) {
  const [feedbackSubTab, setFeedbackSubTab] = useState<FeedbackSubTab>("summary");
  
  // Individual View State
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);

  // Question View State
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
    // Sort: 'none' at bottom, others by count
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

  // --- HELPER COMPONENTS ---

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

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      
      {/* --- SUB NAVIGATION --- */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pt-4 pb-2 border-b border-white/10 mb-8">
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

      {/* --- CONTENT AREA --- */}
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
               {/* Total */}
               <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl">
                 <p className="text-blue-400 text-sm font-semibold uppercase">Total Responses</p>
                 <p className="text-4xl font-bold text-white mt-2">{summary.total}</p>
               </div>
               {/* Avg Ease */}
               <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-xl">
                 <p className="text-green-400 text-sm font-semibold uppercase">Avg Ease of Use</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-white">{summary.avgEaseOfUse.toFixed(1)}</p>
                   <span className="text-white/40">/ 5</span>
                 </div>
               </div>
               {/* Net Rec */}
               <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-xl">
                 <p className="text-purple-400 text-sm font-semibold uppercase">Recommendation</p>
                 <div className="flex items-baseline gap-2 mt-2">
                   <p className="text-4xl font-bold text-white">{summary.avgRecommendation.toFixed(1)}</p>
                   <span className="text-white/40">/ 5</span>
                 </div>
               </div>
            </div>

            {/* Q1 */}
            <QuestionCard index={1} title="First Impressions" icon={PieChart}>
              <DonutChart data={getFirstImpressionChartData} total={summary.total} />
            </QuestionCard>

            {/* Q2 */}
            <QuestionCard index={2} title="Ease of Use" icon={ThumbsUp}>
              <RatingHistogram data={summary.easeOfUse} total={summary.total} emojiMap={EASE_EMOJIS} />
            </QuestionCard>

            {/* Q3 */}
            <QuestionCard index={3} title="Technical Issues Encountered" icon={AlertTriangle}>
              <HorizontalBarChart 
                data={getIssuesChartData.data} 
                total={summary.total} 
                maxVal={getIssuesChartData.max} 
                colorMap={ISSUE_OPTIONS} 
              />
            </QuestionCard>

            {/* Q4 */}
            <QuestionCard index={4} title="Likelihood to Recommend" icon={TrendingUp}>
              <RatingHistogram data={summary.recommendation} total={summary.total} emojiMap={RECOMMEND_EMOJIS} />
            </QuestionCard>

            {/* Q5 - Text Responses */}
            <QuestionCard index={5} title="Additional Feedback" icon={MessageSquare}>
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {responses.filter(r => r.additionalFeedback).map((r, i) => (
                  <div key={i} className="bg-black/20 p-4 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      {r.userId.avatar ? (
                        <img src={r.userId.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                          {r.userId.displayName?.[0] || "U"}
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

            {/* Q6 */}
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
            {/* Pagination Header */}
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

            {/* Individual Response Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* User Header */}
              <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    {currentResponse.userId.avatar ? (
                      <img src={currentResponse.userId.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {currentResponse.userId.displayName?.[0] || "U"}
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

              {/* Answers List */}
              <div className="divide-y divide-white/5">
                {[
                  { q: "1. First Impression", a: currentResponse.firstImpression, type: "badge" },
                  { q: "2. Ease of Use", a: `${currentResponse.easeOfUse} / 5`, type: "rating" },
                  { q: "3. Issues Encountered", a: currentResponse.issues.join(", ") || "None", type: "text" },
                  { q: "4. Likelihood to Recommend", a: `${currentResponse.recommendation} / 5`, type: "rating" },
                  { q: "5. Additional Feedback", a: currentResponse.additionalFeedback || "No answer", type: "long-text" },
                  { q: "6. Referred By", a: currentResponse.referral || "Organic", type: "text" }
                ].map((item, i) => (
                  <div key={i} className="p-6 hover:bg-white/5 transition-colors">
                    <p className="text-xs uppercase text-gray-500 font-bold mb-2">{item.q}</p>
                    <div className={`text-lg ${item.type === 'long-text' && !currentResponse.additionalFeedback ? 'text-gray-500 italic' : 'text-gray-200'}`}>
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

        {/* === QUESTION VIEW === */}
        {feedbackSubTab === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Question Selector */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                value={selectedQuestion}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                className="bg-transparent text-lg font-medium outline-none w-full cursor-pointer text-white [&>option]:bg-gray-900"
              >
                <option value="impression">1. First Impression</option>
                <option value="ease">2. Ease of Use</option>
                <option value="issues">3. Technical Issues</option>
                <option value="recommend">4. Recommendation</option>
                <option value="feedback">5. Written Feedback</option>
              </select>
            </div>

            {/* Answer List for Selected Question */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
               <div className="p-4 bg-white/5 border-b border-white/10 text-sm text-gray-400">
                 {responses.length} responses
               </div>
               <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                 {responses.map((r, i) => {
                   let answer: any = "";
                   if (selectedQuestion === "impression") answer = r.firstImpression;
                   if (selectedQuestion === "ease") answer = r.easeOfUse;
                   if (selectedQuestion === "issues") answer = r.issues.join(", ") || "None";
                   if (selectedQuestion === "recommend") answer = r.recommendation;
                   if (selectedQuestion === "feedback") answer = r.additionalFeedback;

                   if (!answer && selectedQuestion === "feedback") return null; // Skip empty text

                   return (
                     <div key={i} className="p-4 flex items-start gap-4 hover:bg-white/5">
                       {r.userId.avatar ? (
                          <img src={r.userId.avatar} className="w-8 h-8 rounded-full mt-1 opacity-70" />
                       ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs mt-1">{r.userId.displayName[0]}</div>
                       )}
                       <div>
                         <div className="text-gray-200 text-base">{answer}</div>
                         <div className="text-xs text-gray-500 mt-1">{r.userId.displayName} • {new Date(r.createdAt).toLocaleDateString()}</div>
                       </div>
                     </div>
                   )
                 })}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}