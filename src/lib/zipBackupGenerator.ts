import JSZip from "jszip";
import { PhotoSubmission } from "@/types";

interface ZipBackupParams {
  challengeTitle: string;
  submissions: PhotoSubmission[];
}

/**
 * 전체 출품작 고화질 이미지 + 메타데이터 ZIP 압축 생성기
 */
export async function downloadSubmissionsZip({
  challengeTitle,
  submissions,
}: ZipBackupParams): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder("출품작_고화질_아카이브") || zip;

  // 1. 각 출품작 사진 파일 추가
  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    const filename = `[${sub.studentGrade}학년${sub.studentClass}반${sub.studentNumber}번_${sub.nickname}_총${sub.votes}표].jpg`;

    try {
      if (sub.imageUrl.startsWith("data:image/")) {
        // base64 데이터 URL
        const base64Data = sub.imageUrl.split(",")[1];
        folder.file(filename, base64Data, { base64: true });
      } else {
        // 원격 이미지인 경우 fetch 또는 캔버스 캡처
        try {
          const res = await fetch(sub.imageUrl);
          const blob = await res.blob();
          folder.file(filename, blob);
        } catch {
          // CORS 등으로 fetch 불가 시 텍스트 메타데이터로 기록
          folder.file(`${filename}.txt`, `이미지 URL: ${sub.imageUrl}\n제목: ${sub.title}\n작가: ${sub.nickname}`);
        }
      }
    } catch (e) {
      console.warn("Failed to add image to zip:", filename, e);
    }
  }

  // 2. 투표 집계 및 메타데이터 CSV 파일 동봉
  const csvRows = [
    ["순위", "학년", "반", "번호", "작가닉네임", "작품제목", "총득표수", "학생투표", "교직원투표", "학부모공감표", "작가노트(30자)", "출품일시"],
    ...submissions.map((s, idx) => [
      idx + 1,
      s.studentGrade,
      s.studentClass,
      s.studentNumber,
      s.nickname,
      `"${s.title.replace(/"/g, '""')}"`,
      s.votes,
      s.studentVotes || 0,
      s.teacherVotes || 0,
      s.parentVotes || 0,
      `"${(s.caption || "").replace(/"/g, '""')}"`,
      s.submittedAt,
    ]),
  ];
  const csvContent = "\uFEFF" + csvRows.map((r) => r.join(",")).join("\n");
  zip.file("투표_최종_집계표.csv", csvContent);

  // 3. 안내 리드미 파일
  const readmeContent = `[스쿨픽 디지털 사진전 전체 백업 패키지]
사진전 명칭: ${challengeTitle}
백업 일시: ${new Date().toLocaleString("ko-KR")}
총 출품작 수: ${submissions.length}점

* 개인정보 보호 안내: 실명 수집 배제 정책에 따라 학년, 반, 번호, 작가 닉네임으로 저장되었습니다.
* 본 압축 파일은 교내 학교생활기록부 증빙 및 학교 홍보물 제작용으로 안전하게 활용하실 수 있습니다.`;
  zip.file("README_안내사항.txt", readmeContent);

  // 4. ZIP 다운로드 트리거
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `스쿨픽_전체출품작_고화질백업_${challengeTitle}_${new Date().toISOString().split("T")[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
