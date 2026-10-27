import { NextResponse } from "next/server";
import { INITIAL_CHALLENGES, getChallengeByIdOrTheme } from "@/lib/constants";
import { Challenge, ChallengeStatus } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getStoredChallenges,
  saveChallenge,
  deleteChallenge,
  deleteSubmissionsByChallengeId,
} from "@/lib/serverDataStore";

export const dynamic = "force-dynamic";

function toKstDateAndTime(isoStr?: string, defaultTime = "09:00"): { date: string; time: string } {
  if (!isoStr) {
    return { date: new Date().toISOString().slice(0, 10), time: defaultTime };
  }
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) {
    return { date: new Date().toISOString().slice(0, 10), time: defaultTime };
  }
  const kstMs = d.getTime() + 9 * 60 * 60 * 1000;
  const kstDate = new Date(kstMs);
  const yyyy = kstDate.getUTCFullYear();
  const mm = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kstDate.getUTCDate()).padStart(2, "0");
  const hh = String(kstDate.getUTCHours()).padStart(2, "0");
  const min = String(kstDate.getUTCMinutes()).padStart(2, "0");
  return {
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
  };
}

function toIsoWithKstOffset(dateStr?: string, timeStr?: string, fallbackTime = "09:00"): string {
  const date = dateStr || new Date().toISOString().slice(0, 10);
  const time = timeStr && timeStr.length >= 4 ? timeStr.slice(0, 5) : fallbackTime;
  return `${date}T${time}:00+09:00`;
}

function mapRowToChallenge(row: any): Challenge {
  const base = getChallengeByIdOrTheme(row.theme_id || "culture-1");
  const subStart = toKstDateAndTime(row.submission_start, "09:00");
  const subEnd = toKstDateAndTime(row.submission_end, "16:00");
  const voteStart = toKstDateAndTime(row.voting_start, "09:00");
  const voteEnd = toKstDateAndTime(row.voting_end, "17:00");

  let status: ChallengeStatus = "SUBMITTING";
  if (row.status === "VOTING") status = "VOTING";
  else if (row.status === "ENDED") status = "ENDED";

  const voteLimitType =
    row.voting_policy === "DAILY_3" || row.voting_policy === "ONE_1"
      ? row.voting_policy
      : "TOTAL_3";

  return {
    ...base,
    id: row.theme_id || base.id,
    themeId: row.theme_id || base.themeId,
    title: row.title || base.title,
    status,
    voteLimitType,
    submissionStartDate: subStart.date,
    submissionStartTime: subStart.time,
    submissionEndDate: subEnd.date,
    submissionEndTime: subEnd.time,
    votingStartDate: voteStart.date,
    votingStartTime: voteStart.time,
    votingEndDate: voteEnd.date,
    votingEndTime: voteEnd.time,
    schoolCode: row.schools?.school_code || base.schoolCode,
    schoolName: row.schools?.school_name || base.schoolName,
    createdAt: row.created_at ? row.created_at.slice(0, 10) : base.createdAt,
  };
}

async function purgeChallengeSubmissionsInSupabase(supabase: any, challengeId: string) {
  try {
    const { data: allSubs } = await supabase
      .from("submissions")
      .select("id, exhibition_id, thumbnail_url");

    if (allSubs && allSubs.length > 0) {
      const targetIds: string[] = [];
      for (const row of allSubs) {
        let meta: any = {};
        if (typeof row.thumbnail_url === "string" && row.thumbnail_url.startsWith("{")) {
          try {
            meta = JSON.parse(row.thumbnail_url);
          } catch {}
        }
        const rowCid = meta.challengeId || row.exhibition_id || "";
        if (rowCid === challengeId || !rowCid) {
          targetIds.push(row.id);
        }
      }
      if (targetIds.length > 0) {
        await supabase.from("submissions").delete().in("id", targetIds);
      }
    }
  } catch (err) {
    console.warn("Supabase purgeChallengeSubmissions warning:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const schoolCode = searchParams.get("schoolCode");

  // 1. 로컬/메모리 스토어 확인
  const storedChallenges = getStoredChallenges();

  // 2. Supabase DB에서 개설된 전시회 조회
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      let query = supabase
        .from("exhibitions")
        .select("*, schools(school_code, school_name)")
        .order("created_at", { ascending: false });

      if (id) {
        query = query.eq("theme_id", id);
      }

      const { data: rows } = await query;
      if (rows && rows.length > 0) {
        rows.forEach((row: any) => {
          const mapped = mapRowToChallenge(row);
          storedChallenges[mapped.id] = mapped;
        });
      }
    } catch (dbErr) {
      console.warn("Supabase exhibitions GET warning:", dbErr);
    }
  }

  // 특정 ID 조회
  if (id) {
    if (storedChallenges[id]) {
      return NextResponse.json({ success: true, challenge: storedChallenges[id] });
    }

    const direct = INITIAL_CHALLENGES.find((c) => c.id === id);
    if (direct) {
      return NextResponse.json({ success: true, challenge: direct });
    }

    const resolved = getChallengeByIdOrTheme(id);
    return NextResponse.json({ success: true, challenge: resolved });
  }

  // 전체 목록 병합 (실제 개설된 챌린지 우선)
  const map: Record<string, Challenge> = {};
  if (!schoolCode || schoolCode === "TST-7777") {
    INITIAL_CHALLENGES.forEach((c) => {
      map[c.id] = c;
    });
  }
  Object.values(storedChallenges).forEach((c) => {
    map[c.id] = c;
  });

  let list = Object.values(map);
  if (schoolCode && schoolCode !== "TST-7777") {
    const schoolMatches = list.filter((c) => c.schoolCode === schoolCode);
    if (schoolMatches.length > 0) {
      list = schoolMatches;
    }
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
    const resetSubmissions: boolean = body.resetSubmissions === true;

    if (!challenge || !challenge.id) {
      return NextResponse.json(
        { success: false, error: "Invalid challenge data" },
        { status: 400 }
      );
    }

    // 신규 개설 또는 재오픈(resetSubmissions: true) 시 이전 사진전의 잔여 출품작 완전 초기화
    if (resetSubmissions) {
      deleteSubmissionsByChallengeId(challenge.id);
    }

    // 1. 파일/메모리 스토어에 저장
    saveChallenge(challenge);

    // 2. Supabase DB 영구 저장
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        if (resetSubmissions) {
          await purgeChallengeSubmissionsInSupabase(supabase, challenge.id);
        }

        let schoolId: string | null = null;
        const sCode = challenge.schoolCode || "JNE-3012";
        const sName = challenge.schoolName || "우리 학교";

        const { data: schoolData } = await supabase
          .from("schools")
          .select("id")
          .eq("school_code", sCode)
          .maybeSingle();

        if (schoolData) {
          schoolId = schoolData.id;
        } else {
          const { data: newSchool } = await supabase
            .from("schools")
            .insert({
              school_code: sCode,
              school_name: sName,
              region: "전국",
            })
            .select("id")
            .single();
          if (newSchool) schoolId = newSchool.id;
        }

        const subStartIso = toIsoWithKstOffset(challenge.submissionStartDate, challenge.submissionStartTime, "09:00");
        const subEndIso = toIsoWithKstOffset(challenge.submissionEndDate, challenge.submissionEndTime, "16:00");
        const voteStartIso = toIsoWithKstOffset(challenge.votingStartDate, challenge.votingStartTime, "09:00");
        const voteEndIso = toIsoWithKstOffset(challenge.votingEndDate, challenge.votingEndTime, "17:00");
        const purgeDate = new Date(new Date(voteEndIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: existingEx } = await supabase
          .from("exhibitions")
          .select("id")
          .eq("theme_id", challenge.id)
          .maybeSingle();

        const exPayload = {
          school_id: schoolId,
          title: challenge.title,
          theme_id: challenge.id,
          theme_category: challenge.mode || "culture",
          submission_start: subStartIso,
          submission_end: subEndIso,
          voting_start: voteStartIso,
          voting_end: voteEndIso,
          purge_due_date: purgeDate,
          voting_policy: challenge.voteLimitType || "TOTAL_3",
          status: challenge.status || "SUBMITTING",
        };

        if (existingEx?.id) {
          await supabase.from("exhibitions").update(exPayload).eq("id", existingEx.id);
        } else {
          await supabase.from("exhibitions").insert(exPayload);
        }
      } catch (dbErr) {
        console.warn("Supabase exhibition save warning:", dbErr);
      }
    }

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

    // 1. 로컬/메모리 스토어에서 사진전 및 해당 출품작 삭제
    deleteChallenge(id);
    deleteSubmissionsByChallengeId(id);

    // 2. Supabase DB에서도 전시회 및 해당 출품작 완전 삭제
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await purgeChallengeSubmissionsInSupabase(supabase, id);
        await supabase.from("exhibitions").delete().eq("theme_id", id);
      } catch (dbErr) {
        console.warn("Supabase exhibition delete warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Challenge ${id} and its submissions successfully deleted from server store`,
    });
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
