import { NextResponse } from "next/server";
import { INITIAL_CHALLENGES, getChallengeByIdOrTheme } from "@/lib/constants";
import { Challenge } from "@/types";

// 인메모리 및 영구 캐시 (서버 수명 주기 내 보존)
const challengesStore: Record<string, Challenge> = {};

// 초기 챌린지 등록
INITIAL_CHALLENGES.forEach((c) => {
  challengesStore[c.id] = c;
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const schoolCode = searchParams.get("schoolCode");

  // 특정 ID 조회
  if (id) {
    if (challengesStore[id]) {
      return NextResponse.json({ success: true, challenge: challengesStore[id] });
    }

    // INITIAL_CHALLENGES 직접 검색
    const direct = INITIAL_CHALLENGES.find((c) => c.id === id);
    if (direct) {
      challengesStore[id] = direct;
      return NextResponse.json({ success: true, challenge: direct });
    }

    const resolved = getChallengeByIdOrTheme(id);
    if (resolved && resolved.id === id) {
      challengesStore[id] = resolved;
      return NextResponse.json({ success: true, challenge: resolved });
    }

    return NextResponse.json({ success: true, challenge: resolved });
  }

  // 전체 또는 학교별 목록 반환
  let list = Object.values(challengesStore);
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

    // 서버 스토어에 보존 (전체 학생/학부모 실시간 공유)
    challengesStore[challenge.id] = challenge;

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

    // 서버 스토어에서 삭제
    delete challengesStore[id];

    return NextResponse.json({
      success: true,
      message: `Challenge ${id} successfully deleted from server store`,
    });
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
