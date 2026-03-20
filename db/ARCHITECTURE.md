# RankRise D1 Database Architecture

## Complete System Design

---

## 📊 Database Architectural Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         RANKRISE DATABASE                                │
└──────────────────────────────────────────────────────────────────────────┘

                              MASTER DATA
                           ┌──────────────┐
                           │     EXAMS    │
                           │ (JEE, NEET)  │
                           └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────┴──┐   ┌──────┴───┐  ┌─────┴──┐
              │ TESTS  │   │ SUBJECTS │  │ TOPICS │
              └────┬───┘   └──────┬───┘  └────┬───┘
                   │             │            │
         ┌─────────┴──────┐      │            │
         │                │      │            │
    ┌────┴────┐      ┌────┴──────┴────┐     │
    │ QUESTION│      │   QUESTIONS    │◄────┘
    │ OPTIONS │      │  (Question Bank)
    └─────────┘      └────┬───────────┘
                          │
                    ┌─────┴─────┐
                    │           │
              TEST_QUESTIONS   USER_TESTS
              (Mapping)        (Attempts)
                    │           │
                    └─────┬─────┘
                          │
                   ┌──────┴──────┐
                   │             │
            USER_ANSWERS     USER_RESULTS
            (Responses)      (Analytics)
                              │
                    ┌─────────┴─────────┐
                    │                   │
          SUBJECT_WISE_        TOPIC_WISE_
          PERFORMANCE          PERFORMANCE
          (Analysis)           (Analysis)
                    │
            ┌───────┴────────┐
            │                │
        LEADERBOARD       USER_STATISTICS
        (Rankings)        (Cached Stats)
                │
         ┌──────┴──────┐
         │             │
      EXAMS      SUBJECTS
      RANKS      RANKINGS

                 USER TABLE
                 (Central)
              ┌─────┬─────┐
              │     │     │
          Created Takes Stats
```

---

## 📋 Table Breakdown & Relationships

### **Layer 1: Master Data** (Setup Tables)

#### 1. **EXAMS**
```
Purpose: Define exam types (JEE, NEET, EAPCET)
Columns: id, name, description, icon_url, is_active, created_at
Relationships: ↓ Has many SUBJECTS, TESTS
```

#### 2. **SUBJECTS**  
```
Purpose: Subject per exam (Math, Physics, Chemistry)
Columns: id, exam_id, name, description, display_order, is_active
Relationships: ↓ Has many TOPICS, QUESTIONS
Foreign Key: exam_id → EXAMS
```

#### 3. **TOPICS**
```
Purpose: Topics per subject (Calculus, Algebra, Vectors)
Columns: id, subject_id, name, description, display_order, is_active
Relationships: ↓ Categorizes QUESTIONS
Foreign Key: subject_id → SUBJECTS
```

---

### **Layer 2: Question Bank**

#### 4. **QUESTIONS**
```
Purpose: All questions in the system
Columns: 
  - id, exam_id, subject_id, topic_id
  - type (MCQ | NUMERICAL)
  - statement, explanation, solution_video_url
  - difficulty_level (EASY | MEDIUM | HARD)
  - marks, negative_marking
  - created_by (admin/teacher)
  - is_active, created_at, updated_at

Relationships: 
  ↓ Has many QUESTION_OPTIONS (for MCQ)
  ↓ Used in TEST_QUESTIONS
  ↓ Answered in USER_ANSWERS

Foreign Keys: exam_id, subject_id, topic_id, created_by
```

#### 5. **QUESTION_OPTIONS**
```
Purpose: A, B, C, D options for MCQ questions
Columns: 
  - id, question_id
  - option_text, option_index (A=1, B=2, C=3, D=4)
  - is_correct (boolean)

Relationships:
  ↑ Belongs to QUESTIONS
  ↓ Selected in USER_ANSWERS

Foreign Key: question_id → QUESTIONS
```

---

### **Layer 3: Test Management**

#### 6. **TESTS**
```
Purpose: Test configuration (Full-length, Unit-wise, Subject-wise)
Columns:
  - id, exam_id
  - title, description
  - type (FULL_LENGTH | UNIT_WISE | SUBJECT_WISE)
  - duration_minutes, total_questions, total_marks
  - passing_marks, passing_percentage
  - instructions, show_answers
  - is_published, created_by
  - created_at, updated_at

Relationships:
  ↑ Belongs to EXAMS
  ↓ Has many TEST_QUESTIONS
  ↓ Has many USER_TEST_ATTEMPTS

Foreign Keys: exam_id, created_by
```

#### 7. **TEST_QUESTIONS** (Many-to-Many)
```
Purpose: Links questions to tests with sequence & marks
Columns:
  - id, test_id, question_id
  - sequence_number (order in test)
  - marks_for_correct, negative_marking
  - is_optional

Relationships:
  ↑ Belongs to TESTS
  ↑ Belongs to QUESTIONS

Foreign Keys: test_id, question_id
Unique Constraint: (test_id, question_id)
```

---

### **Layer 4: User Activity**

#### 8. **USERS** (Central table)
```
Purpose: Student/User accounts
Columns:
  - id, email (unique), password_hash
  - name, target_exam
  - profile_picture_url, bio
  - is_active, email_verified
  - created_at, updated_at, last_login_at

Relationships:
  ↓ Takes USER_TEST_ATTEMPTS
  ↓ Provides USER_ANSWERS
  ↓ Has USER_RESULTS
  ↓ Has USER_STATISTICS

No Foreign Keys (central hub)
```

#### 9. **USER_TEST_ATTEMPTS**
```
Purpose: Track each test attempt by a user
Columns:
  - id, user_id, test_id
  - status (IN_PROGRESS | SUBMITTED | ABANDONED)
  - started_at, submitted_at
  - score, percentage, time_spent_seconds
  - total_attempted_questions, total_correct_answers
  - total_incorrect_answers, total_unanswered_questions
  - created_at, updated_at

Relationships:
  ↑ Belongs to USERS
  ↑ Belongs to TESTS
  ↓ Has many USER_ANSWERS
  ↓ Generates USER_RESULTS

Foreign Keys: user_id, test_id
```

#### 10. **USER_ANSWERS**
```
Purpose: User's answer to each question
Columns:
  - id, user_attempt_id, question_id
  - selected_option_id (MCQ answer)
  - numerical_answer (NUMERICAL answer)
  - is_marked_for_review
  - is_visited
  - time_spent_seconds
  - is_correct, marks_obtained
  - created_at, updated_at

Relationships:
  ↑ Belongs to USER_TEST_ATTEMPTS
  ↑ Belongs to QUESTIONS
  ↑ Belongs to QUESTION_OPTIONS (for MCQ)

Foreign Keys: user_attempt_id, question_id, selected_option_id
Unique Constraint: (user_attempt_id, question_id) - one answer per question
```

---

### **Layer 5: Results & Analytics**

#### 11. **USER_RESULTS**
```
Purpose: Final result after test submission (Analytics & Leaderboard)
Columns:
  - id, user_id, test_id, attempt_id (unique)
  - score, max_score, percentage
  - rank (in test), percentile
  - accuracy, speed_index
  - time_spent_seconds
  - total_attempted, total_correct, total_incorrect, total_unanswered
  - subject_wise_analysis (JSON)
  - submitted_at, created_at

Relationships:
  ↑ Belongs to USERS
  ↑ Belongs to TESTS
  ↑ Generated from USER_TEST_ATTEMPTS
  ↓ Has many SUBJECT_WISE_PERFORMANCE
  ↓ Has many TOPIC_WISE_PERFORMANCE

Foreign Keys: user_id, test_id, attempt_id

Purpose of subject_wise_analysis:
{
  "physics": { "score": 45, "max": 60, "correct": 3, "incorrect": 2, "unanswered": 0 },
  "chemistry": { "score": 50, "max": 60, "correct": 4, "incorrect": 1, "unanswered": 0 },
  "math": { "score": 40, "max": 60, "correct": 2, "incorrect": 3, "unanswered": 1 }
}
```

#### 12. **SUBJECT_WISE_PERFORMANCE**
```
Purpose: Detailed breakdown of performance per subject
Columns:
  - id, user_result_id, subject_id
  - questions_attempted, questions_correct
  - questions_incorrect, questions_unanswered
  - score, max_score, accuracy
  - created_at

Relationships:
  ↑ Belongs to USER_RESULTS
  ↑ Belongs to SUBJECTS

Foreign Keys: user_result_id, subject_id
```

#### 13. **TOPIC_WISE_PERFORMANCE**
```
Purpose: Deep analytics - performance per topic
Columns:
  - id, user_result_id, topic_id
  - questions_attempted, questions_correct
  - questions_incorrect, questions_unanswered
  - score, max_score, accuracy
  - created_at

Relationships:
  ↑ Belongs to USER_RESULTS
  ↑ Belongs to TOPICS

Foreign Keys: user_result_id, topic_id
```

---

### **Layer 6: Optimization Tables**

#### 14. **USER_STATISTICS** (Cached)
```
Purpose: Quick-access user statistics (denormalized)
Columns:
  - id, user_id (unique)
  - total_tests_taken, total_questions_attempted
  - total_correct_answers, overall_accuracy
  - best_score, average_score
  - rank_in_jee, rank_in_neet, rank_in_eapcet
  - last_test_date
  - created_at, updated_at

Purpose: Instead of calculating from USER_RESULTS each time,
         this table caches the summary stats for fast dashboard loads

Foreign Keys: user_id (unique)
Update: Recalculate after each test submission
```

#### 15. **LEADERBOARD_SNAPSHOTS** (Pre-computed)
```
Purpose: Pre-computed leaderboard rankings for performance
Columns:
  - id, exam_id, test_id, user_id
  - rank, percentile, score
  - snapshot_date, created_at

Purpose: Instead of sorting all users on-demand,
         pre-compute and cache rankings hourly/daily

Foreign Keys: exam_id, test_id, user_id
Use Case: Instant leaderboard display without DB query

Schedule: Compute every hour via scheduler
```

#### 16. **SETTINGS** (Config)
```
Purpose: System configuration and metadata
Columns:
  - id, key (unique), value
  - description, created_at, updated_at

Examples:
  - key: "jee_passing_percentage", value: "40"
  - key: "neet_passing_percentage", value: "50"
  - key: "system_version", value: "1.0.0"
```

---

## 🔄 Data Flow Diagrams

### **Test Submission Flow**
```
User Starts Test
    ↓
User_Test_Attempts: CREATE (status: IN_PROGRESS)
    ↓
User Answers Questions
    ↓
User_Answers: INSERT (for each question)
    ↓
User Submits Test
    ↓
User_Test_Attempts: UPDATE (status: SUBMITTED, submitted_at: now)
    ↓
Calculate Score
    ↓
User_Results: INSERT (score, rank, percentile)
    ↓
Subject_Wise_Performance: INSERT (per subject breakdown)
    ↓
Topic_Wise_Performance: INSERT (per topic breakdown)
    ↓
User_Statistics: UPDATE (increment counters)
    ↓
Leaderboard_Snapshots: UPDATE (recalculate rank)
    ↓
Test Complete ✅
```

### **User Login Flow**
```
User Credentials
    ↓
Query Users: SELECT * WHERE email = ?
    ↓
Verify Password
    ↓
Users: UPDATE (last_login_at)
    ↓
Query User_Statistics (cache hit)
    ↓
Return User + Stats to Frontend ✅
```

### **Leaderboard Display Flow**
```
User Requests Leaderboard for Test X
    ↓
Option A (Fast - Cached):
  Query Leaderboard_Snapshots
  WHERE test_id = X
  ORDER BY rank
  LIMIT 100
  ✅ Returns in 1-2ms

Option B (Fresh - Slower):
  Query User_Results
  WHERE test_id = X
  ORDER BY score DESC
  Calculate rank + percentile
  ⚠️ Returns in 100-500ms
```

---

## 📊 Key Design Features

### **1. Normalization**
- ✅ 3NF database design
- ✅ No data duplication
- ✅ Maintains referential integrity
- ✅ Scalable structure

### **2. Performance Optimization**
- ✅ **Indexes** on frequently queried columns
- ✅ **Denormalization** (USER_STATISTICS) for fast dashboard
- ✅ **Pre-computed** (LEADERBOARD_SNAPSHOTS) for instant rankings
- ✅ **Unique constraints** on critical fields

### **3. Analytics Depth**
- ✅ Subject-wise performance
- ✅ Topic-wise performance
- ✅ Overall accuracy & speed metrics
- ✅ Percentile & ranking

### **4. Flexibility**
- ✅ MCQ + Numerical questions
- ✅ Marks per question configurable
- ✅ Negative marking support
- ✅ Optional questions in tests

### **5. Multi-Exam Support**
- ✅ JEE Main / Advanced
- ✅ NEET
- ✅ EAPCET
- ✅ Easily add new exams

---

## 📈 Schema Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| **Master Tables** | 3 | Exams, Subjects, Topics |
| **Question Bank** | 2 | Questions, Options |
| **Test Management** | 2 | Tests, Test_Questions |
| **User Data** | 1 | Users (central) |
| **Activity Tracking** | 2 | Attempts, Answers |
| **Analytics** | 2 | Results, Subject/Topic Performance |
| **Optimization** | 2 | User_Statistics, Leaderboard_Snapshots |
| **Config** | 1 | Settings |
| **TOTAL** | 15 | Complete system |

---

## 🔐 Data Integrity

### **Foreign Key Relationships**
- All relationships enforced at database level
- Cascading deletes for cleanup
- Unique constraints prevent duplicates

### **Timestamps**
- `created_at`: Auto-set on creation
- `updated_at`: Track changes
- ISO 8601 format for all dates

### **Status Tracking**
- `is_active` flags for soft deletes
- `status` fields for workflow tracking
- `email_verified` for user validation

---

## 📝 Notes for Implementation

1. **D1 SQLite Specific**:
   - Supports `datetime('now')` for timestamps
   - Supports JSON columns for flexible data
   - Single writer at a time (acceptable for MVP)

2. **Indexing Strategy**:
   - Indexed 20+ columns for common queries
   - Composite indexes for test selection
   - Range indexes for rankings

3. **Caching Strategy** (Phase 2):
   - Cache USER_STATISTICS in KV for 1 hour
   - Pre-compute LEADERBOARD_SNAPSHOTS hourly
   - Cache TESTS list in KV for 24 hours

4. **Future Migrations**:
   - This schema works for 100k+ users
   - Scaling beyond 1M: Partition by exam_id
   - Read replicas: Can be added at PostgreSQL stage

---

## ✅ Ready to Proceed?

This architecture provides:
- ✅ All features for RankRise MVP
- ✅ Scalable structure
- ✅ Performance optimization hooks
- ✅ Complete analytics capability
- ✅ Future-proof design
