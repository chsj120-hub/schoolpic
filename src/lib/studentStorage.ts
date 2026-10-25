export interface StudentAccount {
  schoolCode: string;
  grade: number;
  classNum: number;
  studentNum: number;
  nickname: string;
  pin: string; // 4자리 비밀번호
  hasSubmitted?: boolean;
  submittedPhotoId?: string;
  createdAt: string;
}

const STORAGE_KEY = "schoolpick_students_db";

// 기본 샘플 학생 계정들 (교사 화면 초기 렌더링용)
export const DEFAULT_STUDENTS: StudentAccount[] = [
  {
    schoolCode: "KOR-402",
    grade: 5,
    classNum: 2,
    studentNum: 14,
    nickname: "5반 날다람쥐",
    pin: "1234",
    hasSubmitted: true,
    submittedPhotoId: "sub-1",
    createdAt: "2026-10-20",
  },
  {
    schoolCode: "KOR-402",
    grade: 6,
    classNum: 1,
    studentNum: 3,
    nickname: "체육부장",
    pin: "7777",
    hasSubmitted: true,
    submittedPhotoId: "sub-2",
    createdAt: "2026-10-21",
  },
  {
    schoolCode: "KOR-402",
    grade: 5,
    classNum: 2,
    studentNum: 8,
    nickname: "분필마법사",
    pin: "0508",
    hasSubmitted: true,
    submittedPhotoId: "sub-3",
    createdAt: "2026-10-21",
  },
];

export function getStudentKey(grade: number, classNum: number, studentNum: number): string {
  return `${grade}-${classNum}-${studentNum}`;
}

export function getAllStudents(): Record<string, StudentAccount> {
  if (typeof window === "undefined") {
    const map: Record<string, StudentAccount> = {};
    DEFAULT_STUDENTS.forEach((s) => {
      map[getStudentKey(s.grade, s.classNum, s.studentNum)] = s;
    });
    return map;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const map: Record<string, StudentAccount> = {};
    DEFAULT_STUDENTS.forEach((s) => {
      map[getStudentKey(s.grade, s.classNum, s.studentNum)] = s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return map;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function findStudent(grade: number, classNum: number, studentNum: number): StudentAccount | null {
  const all = getAllStudents();
  const key = getStudentKey(grade, classNum, studentNum);
  return all[key] || null;
}

export function saveOrUpdateStudent(student: StudentAccount): void {
  if (typeof window === "undefined") return;
  const all = getAllStudents();
  const key = getStudentKey(student.grade, student.classNum, student.studentNum);
  all[key] = student;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function resetStudentPin(grade: number, classNum: number, studentNum: number, newPin: string = "0000"): StudentAccount {
  const all = getAllStudents();
  const key = getStudentKey(grade, classNum, studentNum);
  if (all[key]) {
    all[key].pin = newPin;
  } else {
    all[key] = {
      schoolCode: "KOR-402",
      grade,
      classNum,
      studentNum,
      nickname: `${classNum}반 ${studentNum}번 작가`,
      pin: newPin,
      createdAt: new Date().toISOString(),
    };
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return all[key];
}
