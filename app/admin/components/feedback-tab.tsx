"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);

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

  const currentResponse = responses[selectedResponseIndex];

  return (
    <div className="space-y-6">
      {/* Feedback Sub-Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/10 dark:bg-black/20 p-1 rounded-xl inline-flex shadow-inner">
          {["summary", "question", "individual"].map(tab => (
            <button
              key={tab}
              onClick={() => setFeedbackSubTab(tab as FeedbackSubTab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                feedbackSubTab === tab 
                  ? 'bg-white shadow-sm text-black dark:bg-gray-700 dark:text-white' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary View */}
      {feedbackSubTab === 'summary' && summary && (
        <div className="space-y-8 pb-20">
          {/* Top Level Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-strong rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-24 h-24" /></div>
              <h3 className="text-lg font-semibold mb-2 text-gray-500">Total Responses</h3>
              <p className="text-5xl font-bold text-primary">{summary.total}</p>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ThumbsUp className="w-24 h-24" /></div>
              <h3 className="text-lg font-semibold mb-2 text-gray-500">Avg Ease of Use</h3>
              <div className="flex items-end justify-center gap-2">
                <p className="text-5xl font-bold text-secondary">{summary.avgEaseOfUse.toFixed(1)}</p>
                <span className="text-gray-400 mb-2">/ 5.0</span>
              </div>
            </div>
            <div className="glass-strong rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-24 h-24" /></div>
              <h3 className="text-lg font-semibold mb-2 text-gray-500">Net Recommendation</h3>
              <div className="flex items-end justify-center gap-2">
                <p className="text-5xl font-bold text-accent">{summary.avgRecommendation.toFixed(1)}</p>
                <span className="text-gray-400 mb-2">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Q1: First Impression */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">1. First Impressions</h3>
            </div>
            <DonutChart data={getFirstImpressionChartData} total={summary.total} />
          </div>

          {/* Q2: Ease of Use */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">2. How Easy Was It?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Distribution of ratings from 1 (Confusing) to 5 (Super Easy)</p>
            <RatingHistogram data={summary.easeOfUse} total={summary.total} emojiMap={EASE_EMOJIS} />
          </div>

          {/* Q3: Issues */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">3. Technical Issues</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Percentage of users who experienced specific issues</p>
            <HorizontalBarChart 
              data={getIssuesChartData.data} 
              total={summary.total} 
              maxVal={getIssuesChartData.max} 
              colorMap={ISSUE_OPTIONS} 
            />
          </div>

          {/* Q4: Recommendation */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-600 dark:text-yellow-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">4. Would You Share It?</h3>
            </div>
            <RatingHistogram data={summary.recommendation} total={summary.total} emojiMap={RECOMMEND_EMOJIS} />
          </div>

          {/* Q5: Additional Feedback */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">5. Recent Thoughts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responses
                .filter(r => r.additionalFeedback)
                .slice(0, 6)
                .map((r, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <p className="italic text-gray-700 dark:text-gray-300 mb-3">"{r.additionalFeedback}"</p>
                    <div className="flex items-center gap-2">
                      {r.userId.avatar ? (
                        <img src={r.userId.avatar} className="w-6 h-6 rounded-full" alt={r.userId.displayName} />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-[10px] text-white font-bold">
                          {r.userId.displayName[0]}
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{r.userId.displayName}</span>
                    </div>
                  </div>
                ))}
              {responses.filter(r => r.additionalFeedback).length === 0 && (
                <p className="text-gray-500 italic col-span-2 text-center py-4">No written feedback yet.</p>
              )}
            </div>
          </div>

          {/* Q6: Referrals */}
          <div className="glass-strong rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">6. Referral Leaderboard</h3>
            </div>
            <HorizontalBarChart 
              data={getReferralChartData.data} 
              total={summary.total} 
              maxVal={getReferralChartData.max}
            />
          </div>
        </div>
      )}

      {/* Individual View */}
      {feedbackSubTab === 'individual' && responses.length > 0 && (
        <div className="space-y-6">
          {/* Paginator */}
          <div className="glass-strong rounded-2xl p-3 flex items-center justify-between sticky top-4 z-10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedResponseIndex(p => Math.max(0, p-1))} 
                disabled={selectedResponseIndex === 0} 
                className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <span className="font-mono font-bold">{selectedResponseIndex + 1} / {responses.length}</span>
              <button 
                onClick={() => setSelectedResponseIndex(p => Math.min(responses.length-1, p+1))} 
                disabled={selectedResponseIndex === responses.length-1} 
                className="p-2 hover:bg-black/10 rounded-full disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
          </div>

          {/* Content */}
          {currentResponse && (
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {currentResponse.userId.displayName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentResponse.userId.displayName}</h2>
                  <p className="text-gray-500">{currentResponse.userId.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-xs uppercase text-gray-500 font-bold">1. Impression</span>
                  <div className="font-medium text-lg">{currentResponse.firstImpression}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-xs uppercase text-gray-500 font-bold">2. Ease</span>
                  <div className="font-medium text-lg">{currentResponse.easeOfUse}/5</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-xs uppercase text-gray-500 font-bold">5. Comments</span>
                  <div className="font-medium text-lg italic">"{currentResponse.additionalFeedback || "No comment"}"</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question View Placeholder */}
      {feedbackSubTab === 'question' && (
        <div className="glass-strong rounded-2xl p-8 text-center text-gray-500">
          Question-by-question view (implement as needed)
        </div>
      )}
    </div>
  );
}
