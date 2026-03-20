// ============================================================================
// Type Definitions for RankRise Backend
// ============================================================================

// ─── Authentication Types ─────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  targetExam: ExamType
  profilePictureUrl?: string
  bio?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  targetExam: ExamType
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Exam Types ──────────────────────────────────────────────────────────

export type ExamType = 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'EAPCET'

export type TestType = 'FULL_LENGTH' | 'UNIT_WISE' | 'SUBJECT_WISE'

export type QuestionType = 'MCQ' | 'NUMERICAL'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

// ─── Database Types ──────────────────────────────────────────────────────

export interface Exam {
  id: string
  name: string
  description?: string
  iconUrl?: string
  isActive: boolean
  createdAt: string
}

export interface Subject {
  id: string
  examId: string
  name: string
  description?: string
  displayOrder?: number
  isActive: boolean
  createdAt: string
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  description?: string
  displayOrder?: number
  isActive: boolean
  createdAt: string
}

export interface Question {
  id: string
  examId: string
  subjectId: string
  topicId?: string
  type: QuestionType
  statement: string
  explanation?: string
  solutionVideoUrl?: string
  difficultyLevel: DifficultyLevel
  marks: number
  negativeMarking: number
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  id: string
  questionId: string
  optionText: string
  optionIndex: number
  isCorrect: boolean
  createdAt: string
}

export interface Test {
  id: string
  examId: string
  title: string
  description?: string
  type: TestType
  durationMinutes: number
  totalQuestions: number
  totalMarks: number
  passingMarks?: number
  passingPercentage?: number
  instructions?: string
  isPublished: boolean
  showAnswers: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface UserTestAttempt {
  id: string
  userId: string
  testId: string
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED'
  startedAt: string
  submittedAt?: string
  score?: number
  percentage?: number
  timeSpentSeconds?: number
  totalAttemptedQuestions: number
  totalCorrectAnswers: number
  totalIncorrectAnswers: number
  totalUnansweredQuestions: number
  createdAt: string
  updatedAt: string
}

export interface UserAnswer {
  id: string
  userAttemptId: string
  questionId: string
  selectedOptionId?: string
  numericalAnswer?: string
  isMarkedForReview: boolean
  isVisited: boolean
  timeSpentSeconds: number
  isCorrect?: boolean
  marksObtained?: number
  createdAt: string
  updatedAt: string
}

export interface UserResult {
  id: string
  userId: string
  testId: string
  attemptId: string
  score: number
  maxScore: number
  percentage: number
  rank?: number
  percentile?: number
  accuracy: number
  speedIndex?: number
  timeSpentSeconds: number
  totalAttempted: number
  totalCorrect: number
  totalIncorrect: number
  totalUnanswered: number
  subjectWiseAnalysis?: string // JSON
  submittedAt: string
  createdAt: string
}

// ─── JWT Token Types ─────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// ─── API Response Types ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Environment Types ──────────────────────────────────────────────────

export interface Env {
  DB: D1Database
  KV?: KVNamespace
  JWT_SECRET: string
  ENVIRONMENT: 'development' | 'production'
}
