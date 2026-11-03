-- db/schema.sql — โครงตารางเท่านั้น (ข้อมูลอยู่ใน seed.sql)
-- Docker รันไฟล์ใน /docker-entrypoint-initdb.d ตามตัวอักษร: schema.sql ก่อน seed.sql

CREATE TABLE "students" (
  "student_id" TEXT PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "faculty" TEXT NOT NULL
);

CREATE TABLE "courses" (
  "course_code" TEXT PRIMARY KEY,
  "course_name" TEXT NOT NULL,
  "credit" INT NOT NULL CHECK (credit > 0),
  "seats" INT NOT NULL CHECK (seats >= 0)
);

CREATE TABLE "enrollments" (
  "id" SERIAL PRIMARY KEY,
  "student_id" TEXT NOT NULL,
  "course_code" TEXT NOT NULL,
  "semester" TEXT NOT NULL
);

CREATE TABLE "grades" (
  "id" SERIAL PRIMARY KEY,
  "student_id" TEXT NOT NULL,
  "course_code" TEXT NOT NULL,
  "semester" TEXT NOT NULL,
  "grade" TEXT NOT NULL CHECK (grade IN ('A','B+','B','C+','C','D+','D','F'))
);

CREATE TABLE "schedules" (
  "id" SERIAL PRIMARY KEY,
  "course_code" TEXT NOT NULL,
  "day" TEXT NOT NULL,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "room" TEXT,
  "exam_date" DATE,
  "exam_start" TEXT,
  "exam_end" TEXT,
  "exam_room" TEXT
);

CREATE TABLE "announcements" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "published_at" DATE NOT NULL DEFAULT (CURRENT_DATE)
);

CREATE UNIQUE INDEX ON "enrollments" ("student_id", "course_code", "semester");

CREATE INDEX "idx_enroll_student" ON "enrollments" ("student_id", "semester");

CREATE INDEX "idx_enroll_course" ON "enrollments" ("course_code", "semester");

CREATE UNIQUE INDEX ON "grades" ("student_id", "course_code", "semester");

CREATE INDEX "idx_grades_student" ON "grades" ("student_id", "semester");

CREATE INDEX "idx_schedules_course" ON "schedules" ("course_code");

ALTER TABLE "enrollments" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("student_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "enrollments" ADD FOREIGN KEY ("course_code") REFERENCES "courses" ("course_code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "grades" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("student_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "grades" ADD FOREIGN KEY ("course_code") REFERENCES "courses" ("course_code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "schedules" ADD FOREIGN KEY ("course_code") REFERENCES "courses" ("course_code") DEFERRABLE INITIALLY IMMEDIATE;
