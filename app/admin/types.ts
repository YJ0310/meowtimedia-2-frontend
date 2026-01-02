export interface AdminUser {
  _id: string;
  displayName: string;
  email: string;
  role: "user" | "admin" | "owner";
  adminExpiresAt?: string;
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface FeedbackSummary {
  total: number;
  avgEaseOfUse: number;
  avgRecommendation: number;
  issues: { _id: string; count: number }[];
  firstImpression: { _id: string; count: number }[];
  referral: { _id: string; count: number }[];
  easeOfUse: { _id: number; count: number }[];
  recommendation: { _id: number; count: number }[];
}

export interface FeedbackResponse {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  firstImpression: string;
  firstImpressionOther?: string;
  easeOfUse: number;
  issues: string[];
  issuesOther?: string;
  recommendation: number;
  additionalFeedback?: string;
  referral: string;
  createdAt: string;
}

export interface Candidate {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  reason: string;
  suggestedBy: { displayName: string; email: string };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type TabType = "feedback" | "users" | "manageAdmins";
export type FeedbackSubTab = "summary" | "question" | "individual";
export type ModalType = "add" | "propose" | "approve" | "editExpiry" | null;
