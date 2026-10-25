import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";
import { sanitizePath } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawKey = resolvedParams.path ? resolvedParams.path.join("/") : "";
    const key = sanitizePath(rawKey);

    if (!key || key.includes("..") || key.startsWith("/")) {
      return new NextResponse("Invalid file path", { status: 400 });
    }

    const r2 = getR2Client();
    if (!r2) {
      return new NextResponse("Cloudflare R2 is not configured", { status: 500 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2.send(command);

    if (!response.Body) {
      return new NextResponse("Object not found", { status: 404 });
    }

    // Stream the body or convert to Buffer
    const byteArray = await response.Body.transformToByteArray();

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        "Content-Type": response.ContentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(byteArray.byteLength),
      },
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return new NextResponse("File not found in storage", { status: 404 });
    }
    console.error("R2 fetch image error:", error);
    return new NextResponse("Error reading image from storage", { status: 500 });
  }
}
