import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    console.log("Cloudinary config:", {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓" : "✗",
      api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "✗",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "✗",
    });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не надано" }, { status: 400 });
    }

    console.log("File received:", { name: file.name, size: file.size, type: file.type });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Дозволені лише зображення" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Макс 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Buffer created:", buffer.length);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "pos-app" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            reject(error);
          } else {
            console.log("Cloudinary success:", result?.secure_url);
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error: any) {
    console.error("Upload error details:", error);
    return NextResponse.json(
      { error: error?.message || "Помилка при завантаженні" },
      { status: 500 }
    );
  }
}