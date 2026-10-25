import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const {
      submissionId,
      voterType = "STUDENT",
      voterFingerprint = "anon",
      action = "VOTE",
    } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, message: "작품 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ success: true, source: "LOCAL_FALLBACK" });
    }

    // UUID 형태인지 검사 (샘플 목데이터는 UUID가 아니므로 안전 처리)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
    if (!isUuid) {
      return NextResponse.json({ success: true, source: "MOCK_SUBMISSION" });
    }

    if (action === "VOTE") {
      // 1. 투표 로그 기록
      await supabase.from("votes_log").insert({
        submission_id: submissionId,
        voter_fingerprint: voterFingerprint,
        voter_type: voterType,
      });

      // 2. 작품 투표수 증가
      const voteField =
        voterType === "TEACHER"
          ? "teacher_votes"
          : voterType === "PARENT"
          ? "parent_votes"
          : "student_votes";

      // 현재 투표수 조회
      const { data: current } = await supabase
        .from("submissions")
        .select("vote_count, student_votes, teacher_votes, parent_votes")
        .eq("id", submissionId)
        .single();

      if (current) {
        const updatedTotal = (current.vote_count || 0) + 1;
        const updatedTypeCount = ((current as any)[voteField] || 0) + 1;

        await supabase
          .from("submissions")
          .update({
            vote_count: updatedTotal,
            [voteField]: updatedTypeCount,
          })
          .eq("id", submissionId);

        return NextResponse.json({
          success: true,
          voteCount: updatedTotal,
          typeVotes: updatedTypeCount,
        });
      }
    } else if (action === "UNVOTE") {
      // 투표 취소
      await supabase
        .from("votes_log")
        .delete()
        .eq("submission_id", submissionId)
        .eq("voter_fingerprint", voterFingerprint);

      const voteField =
        voterType === "TEACHER"
          ? "teacher_votes"
          : voterType === "PARENT"
          ? "parent_votes"
          : "student_votes";

      const { data: current } = await supabase
        .from("submissions")
        .select("vote_count, student_votes, teacher_votes, parent_votes")
        .eq("id", submissionId)
        .single();

      if (current) {
        const updatedTotal = Math.max(0, (current.vote_count || 0) - 1);
        const updatedTypeCount = Math.max(0, ((current as any)[voteField] || 0) - 1);

        await supabase
          .from("submissions")
          .update({
            vote_count: updatedTotal,
            [voteField]: updatedTypeCount,
          })
          .eq("id", submissionId);

        return NextResponse.json({
          success: true,
          voteCount: updatedTotal,
          typeVotes: updatedTypeCount,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Votes API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "투표 처리 중 오류 발생" },
      { status: 500 }
    );
  }
}
