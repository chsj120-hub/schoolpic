import fs from "fs";
import path from "path";
import os from "os";
import type { Challenge, PhotoSubmission } from "@/types";

// Vercel/Serverless 환경 지원: process.cwd() 쓰기 제한 시 os.tmpdir() 사용
function resolveDataDir(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "schoolpick_data");
  }
  return path.join(process.cwd(), ".data");
}

const DATA_DIR = resolveDataDir();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create data dir, memory cache will be used:", e);
  }
}

// ----------------------------------------------------------------------------
// 1. 교사 계정 스토어 (teachers.json + 메모리 캐시)
// ----------------------------------------------------------------------------
export interface StoredTeacherAccount {
  email: string;
  name: string;
  password?: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  schoolRegion: string;
  schoolLevel: "E" | "M" | "H";
  roleGrade: string;
  isJoinedExisting: boolean;
  createdAt: string;
}

const TEACHERS_FILE = path.join(DATA_DIR, "teachers.json");

// 관리자 기본 계정 상수
export const DEV_ADMIN_ACCOUNT: StoredTeacherAccount = {
  email: "chsj120@gmail.com",
  password: "blue7412",
  name: "관리자 선생님",
  schoolId: "sch-test-001",
  schoolName: "테스트초등학교",
  schoolCode: "TST-7777",
  schoolRegion: "서울",
  schoolLevel: "E",
  roleGrade: "총괄 관리자",
  isJoinedExisting: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

let memoryTeachers: StoredTeacherAccount[] = [DEV_ADMIN_ACCOUNT];

export function getStoredTeachers(): StoredTeacherAccount[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TEACHERS_FILE)) {
      const raw = fs.readFileSync(TEACHERS_FILE, "utf-8");
      const list: StoredTeacherAccount[] = JSON.parse(raw);
      if (!list.some((t) => t.email.toLowerCase() === DEV_ADMIN_ACCOUNT.email.toLowerCase())) {
        list.unshift(DEV_ADMIN_ACCOUNT);
      }
      memoryTeachers = list;
      return list;
    }
  } catch (err) {
    console.warn("Fallback to memoryTeachers:", err);
  }
  return memoryTeachers;
}

export function saveTeacher(account: StoredTeacherAccount): void {
  ensureDataDir();
  const list = getStoredTeachers();
  const existingIdx = list.findIndex((t) => t.email.toLowerCase() === account.email.toLowerCase());
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...account };
  } else {
    list.push(account);
  }
  memoryTeachers = list;
  try {
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to teachers.json:", err);
  }
}

/**
 * 관리자 계정(chsj120@gmail.com)을 제외한 모든 계정 초기화
 */
export function resetNonAdminTeachers(): void {
  ensureDataDir();
  memoryTeachers = [DEV_ADMIN_ACCOUNT];
  try {
    fs.writeFileSync(TEACHERS_FILE, JSON.stringify(memoryTeachers, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to teachers.json:", err);
  }
}

// ----------------------------------------------------------------------------
// 2. 사진전(Challenges/Exhibitions) 스토어 (challenges.json + 메모리 캐시)
// ----------------------------------------------------------------------------
const CHALLENGES_FILE = path.join(DATA_DIR, "challenges.json");
let memoryChallenges: Record<string, Challenge> = {};

export function getStoredChallenges(): Record<string, Challenge> {
  ensureDataDir();
  try {
    if (fs.existsSync(CHALLENGES_FILE)) {
      const raw = fs.readFileSync(CHALLENGES_FILE, "utf-8");
      memoryChallenges = JSON.parse(raw);
      return memoryChallenges;
    }
  } catch (err) {
    console.warn("Fallback to memoryChallenges:", err);
  }
  return memoryChallenges;
}

export function saveChallenge(challenge: Challenge): void {
  ensureDataDir();
  const challenges = getStoredChallenges();
  challenges[challenge.id] = challenge;
  memoryChallenges = challenges;
  try {
    fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to challenges.json:", err);
  }
}

export function deleteChallenge(id: string): void {
  ensureDataDir();
  const challenges = getStoredChallenges();
  if (challenges[id]) {
    delete challenges[id];
    memoryChallenges = challenges;
    try {
      fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write to challenges.json:", err);
    }
  }
}

// ----------------------------------------------------------------------------
// 3. 학생 출품작(Submissions) 스토어 (submissions.json + 메모리 캐시)
// ----------------------------------------------------------------------------
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
let memorySubmissions: any[] = [];

export function getStoredSubmissions(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      memorySubmissions = JSON.parse(raw);
      return memorySubmissions;
    }
  } catch (err) {
    console.warn("Fallback to memorySubmissions:", err);
  }
  return memorySubmissions;
}

export function saveSubmission(submission: any): void {
  ensureDataDir();
  const list = getStoredSubmissions();
  const existingIdx = list.findIndex((s) => s.id === submission.id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...submission };
  } else {
    list.unshift(submission);
  }
  memorySubmissions = list;
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to submissions.json:", err);
  }
}

export function updateSubmissionStatus(id: string, updates: Partial<any>): boolean {
  ensureDataDir();
  const list = getStoredSubmissions();
  const idx = list.findIndex((s) => s.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates };
    memorySubmissions = list;
    try {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write to submissions.json:", err);
    }
    return true;
  }
  return false;
}

export function deleteSubmissionById(id: string): void {
  ensureDataDir();
  const list = getStoredSubmissions();
  const next = list.filter((s) => s.id !== id);
  memorySubmissions = next;
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to submissions.json:", err);
  }
}

export function deleteSubmissionsByChallengeId(challengeId: string): void {
  ensureDataDir();
  const list = getStoredSubmissions();
  const next = list.filter((s) => s.challengeId && s.challengeId !== challengeId);
  memorySubmissions = next;
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(next, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to submissions.json:", err);
  }
}
