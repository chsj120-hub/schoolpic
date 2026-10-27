import { NextResponse } from "next/server";
import { INITIAL_CHALLENGES, getChallengeByIdOrTheme } from "@/lib/constants";
import { Challenge } from "@/types";
import {
  getStoredChallenges,
  saveChallenge,
  deleteChallenge,
} from "@/lib/serverDataStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const schoolCode = searchParams.get("schoolCode");

  // 파일 영구 스토어에서 최신 챌린지 딕셔너리 로드
  const storedChallenges = getStoredChallenges();

  // 특정 ID 조회
  if (id) {
    if (storedChallenges[id]) {
      return NextResponse.json({ success: true, challenge: storedChallenges[id] });
    }

    // INITIAL_CHALLENGES 직접 검색
    const direct = INITIAL_CHALLENGES.find((c) => c.id === id);
    if (direct) {
      return NextResponse.json({ success: true, challenge: direct });
    }

    const resolved = getChallengeByIdOrTheme(id);
    return NextResponse.json({ success: true, challenge: resolved });
  }

  // 전체 목록 병합 (초기 챌린지 + 사용자 생성 챌린지)
  const map: Record<string, Challenge> = {};
  INITIAL_CHALLENGES.forEach((c) => {
    map[c.id] = c;
  });
  Object.values(storedChallenges).forEach((c) => {
    map[c.id] = c;
  });

  let list = Object.values(map);
  if (schoolCode) {
    list = list.filter((c) => !c.schoolCode || c.schoolCode === schoolCode);
  }

  return NextResponse.json({
    success: true,
    challenges: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const challenge: Challenge = body.challenge;

    if (!challenge || !challenge.id) {
      return NextResponse.json(
        { success: false, error: "Invalid challenge data" },
        { status: 400 }
      );
    }

    // 파일 영구 스토어에 즉시 저장 (.data/challenges.json)
    saveChallenge(challenge);

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("Failed to save challenge:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Challenge ID required" }, { status: 400 });
    }

    // 파일 영구 스토어에서 삭제
    deleteChallenge(id);

    return NextResponse.json({
      success: true,
      message: `Challenge ${id} successfully deleted from server store`,
    });
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
