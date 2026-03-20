-- ============================================================================
-- RankRise D1 Database Initialization Script
-- Complete schema for multi-exam mock test platform
-- ============================================================================

-- ============================================================================
-- 1. EXAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- 2. SUBJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  UNIQUE(exam_id, name)
);

-- ============================================================================
-- 3. TOPICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  UNIQUE(subject_id, name)
);

-- ============================================================================
-- 4. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  target_exam TEXT NOT NULL,
  profile_picture_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT 1,
  email_verified BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- ============================================================================
-- 5. QUESTIONS TABLE (Question Bank)
-- ============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT,
  type TEXT NOT NULL,
  statement TEXT NOT NULL,
  explanation TEXT,
  solution_video_url TEXT,
  difficulty_level TEXT DEFAULT 'MEDIUM',
  marks REAL NOT NULL DEFAULT 1.0,
  negative_marking REAL DEFAULT 0.25,
  created_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================================
-- 6. QUESTION OPTIONS TABLE (MCQ options)
-- ============================================================================
CREATE TABLE IF NOT EXISTS question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(question_id, option_index)
);

-- ============================================================================
-- 7. TESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  total_marks REAL NOT NULL,
  passing_marks REAL,
  passing_percentage REAL,
  instructions TEXT,
  is_published BOOLEAN DEFAULT 0,
  show_answers BOOLEAN DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================================
-- 8. TEST QUESTIONS TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_questions (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  marks_for_correct REAL NOT NULL,
  negative_marking REAL DEFAULT 0.25,
  is_optional BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE(test_id, question_id)
);

-- ============================================================================
-- 9. USER TEST ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  score REAL,
  percentage REAL,
  time_spent_seconds INTEGER,
  total_attempted_questions INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_incorrect_answers INTEGER DEFAULT 0,
  total_unanswered_questions INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- ============================================================================
-- 10. USER ANSWERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_answers (
  id TEXT PRIMARY KEY,
  user_attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_option_id TEXT,
  numerical_answer TEXT,
  is_marked_for_review BOOLEAN DEFAULT 0,
  is_visited BOOLEAN DEFAULT 1,
  time_spent_seconds INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  marks_obtained REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_attempt_id) REFERENCES user_test_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES question_options(id),
  UNIQUE(user_attempt_id, question_id)
);

-- ============================================================================
-- 11. USER RESULTS TABLE (Analytics & Leaderboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL UNIQUE,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  percentage REAL NOT NULL,
  rank INTEGER,
  percentile REAL,
  accuracy REAL,
  speed_index REAL,
  time_spent_seconds INTEGER,
  total_attempted INTEGER,
  total_correct INTEGER,
  total_incorrect INTEGER,
  total_unanswered INTEGER,
  subject_wise_analysis TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (attempt_id) REFERENCES user_test_attempts(id)
);

-- ============================================================================
-- 12. SUBJECT WISE PERFORMANCE TABLE (For detailed analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subject_wise_performance (
  id TEXT PRIMARY KEY,
  user_result_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  questions_incorrect INTEGER DEFAULT 0,
  questions_unanswered INTEGER DEFAULT 0,
  score REAL DEFAULT 0,
  max_score REAL DEFAULT 0,
  accuracy REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_result_id) REFERENCES user_results(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  UNIQUE(user_result_id, subject_id)
);

-- ============================================================================
-- 13. TOPICS WISE PERFORMANCE TABLE (For detailed analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS topic_wise_performance (
  id TEXT PRIMARY KEY,
  user_result_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  questions_incorrect INTEGER DEFAULT 0,
  questions_unanswered INTEGER DEFAULT 0,
  score REAL DEFAULT 0,
  max_score REAL DEFAULT 0,
  accuracy REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_result_id) REFERENCES user_results(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  UNIQUE(user_result_id, topic_id)
);

-- ============================================================================
-- 14. USER STATISTICS TABLE (Quick access to user stats)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_statistics (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  total_tests_taken INTEGER DEFAULT 0,
  total_questions_attempted INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  overall_accuracy REAL DEFAULT 0,
  best_score REAL DEFAULT 0,
  average_score REAL DEFAULT 0,
  rank_in_jee REAL,
  rank_in_neet REAL,
  rank_in_eapcet REAL,
  last_test_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 15. LEADERBOARD SNAPSHOT TABLE (Pre-computed for performance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  test_id TEXT,
  user_id TEXT NOT NULL,
  rank INTEGER,
  percentile REAL,
  score REAL,
  snapshot_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- 16. SETTINGS/CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_target_exam ON users(target_exam);

-- Exam & Subject hierarchies
CREATE INDEX IF NOT EXISTS idx_subjects_exam ON subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);

-- Question lookups
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

-- Test relationships
CREATE INDEX IF NOT EXISTS idx_tests_exam ON tests(exam_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question ON test_questions(question_id);

-- User attempts & answers
CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_test ON user_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_status ON user_test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt ON user_answers(user_attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);

-- Results & Analytics
CREATE INDEX IF NOT EXISTS idx_user_results_user ON user_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_results_test ON user_results(test_id);
CREATE INDEX IF NOT EXISTS idx_user_results_rank ON user_results(rank);
CREATE INDEX IF NOT EXISTS idx_subject_performance_user_result ON subject_wise_performance(user_result_id);
CREATE INDEX IF NOT EXISTS idx_topic_performance_user_result ON topic_wise_performance(user_result_id);

-- Leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_exam ON leaderboard_snapshots(exam_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_snapshots(rank);

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

INSERT OR IGNORE INTO exams (id, name, description) VALUES
  ('exam_jee_mains', 'JEE Main', 'Joint Entrance Examination Main'),
  ('exam_jee_advanced', 'JEE Advanced', 'Joint Entrance Examination Advanced'),
  ('exam_neet', 'NEET', 'National Eligibility cum Entrance Test'),
  ('exam_eapcet', 'EAPCET', 'Engineering Agriculture and Pharmacy Common Entrance Test');

-- Insert subjects for JEE Mains
INSERT OR IGNORE INTO subjects (id, exam_id, name, display_order) VALUES
  ('subj_jee_math', 'exam_jee_mains', 'Mathematics', 1),
  ('subj_jee_physics', 'exam_jee_mains', 'Physics', 2),
  ('subj_jee_chemistry', 'exam_jee_mains', 'Chemistry', 3);

-- Insert subjects for NEET
INSERT OR IGNORE INTO subjects (id, exam_id, name, display_order) VALUES
  ('subj_neet_physics', 'exam_neet', 'Physics', 1),
  ('subj_neet_chemistry', 'exam_neet', 'Chemistry', 2),
  ('subj_neet_biology', 'exam_neet', 'Biology', 3);

-- Insert topics for JEE Math
INSERT OR IGNORE INTO topics (id, subject_id, name, display_order) VALUES
  ('topic_calculus', 'subj_jee_math', 'Calculus', 1),
  ('topic_algebra', 'subj_jee_math', 'Algebra', 2),
  ('topic_geometry', 'subj_jee_math', 'Coordinate Geometry', 3);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
