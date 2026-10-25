import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "2f41fe6863b5dc52fb9df571b71d3a29";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "schoolpick";
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

/**
 * Cloudflare R2 S3 호환 클라이언트
 * AccessKey 및 SecretKey가 설정되었을 때만 인스턴스를 반환합니다.
 */
export function getR2Client(): S3Client | null {
  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Base64 이미지를 Cloudflare R2 버킷에 업로드
 */
export async function uploadBase64ToR2({
  base64Data,
  filename,
  contentType = "image/jpeg",
}: {
  base64Data: string;
  filename: string;
  contentType?: string;
}): Promise<string | null> {
  const r2 = getR2Client();
  if (!r2) return null;

  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });

    await r2.send(command);

    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${filename}`;
    }

    // R2 퍼블릭 도메인이 미설정된 경우 자체 /api/images 프록시 라우트를 통해 즉각 브라우저 렌더링 지원
    return `/api/images/${filename}`;
  } catch (error) {
    console.error("Cloudflare R2 Upload Failed:", error);
    return null;
  }
}
