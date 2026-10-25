import { NextResponse } from "next/server";
import { uploadBase64ToR2 } from "@/lib/r2";
import { validateImageBase64, sanitizePath } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { imageBase64, filename, folder = "submissions" } = await request.json();

    const validation = validateImageBase64(imageBase64);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const cleanFolder = sanitizePath(folder || "submissions");
    const cleanFilename = sanitizePath(filename || "photo.jpg");
    const safeName = `${cleanFolder}/${Date.now()}_${cleanFilename}`;

    // 1. Cloudflare R2에 업로드 시도
    const uploadedUrl = await uploadBase64ToR2({
      base64Data: imageBase64,
      filename: safeName,
    });

    if (uploadedUrl) {
      return NextResponse.json({
        success: true,
        source: "CLOUDFLARE_R2",
        url: uploadedUrl,
      });
    }

    // 2. R2 키 미입력 상태일 때는 base64 그대로 반환 (Fallback 안전망)
    return NextResponse.json({
      success: true,
      source: "LOCAL_BASE64",
      url: imageBase64,
      message: "R2 키 미설정 상태로 로컬 데이터 URL로 안전 처리되었습니다.",
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { success: false, message: "사진 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
