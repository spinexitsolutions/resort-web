import { promises as fs } from "fs";
import path from "path";
import { bad, guard, ok } from "@/lib/api";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "video/mp4": "mp4" };

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return bad("No file");
  const ext = TYPES[file.type];
  if (!ext) return bad("Unsupported file type");
  if (file.size > 15 * 1024 * 1024) return bad("File too large (max 15MB)");
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
    return ok({ url: `/uploads/${name}` });
  } catch {
    // read-only host: fall back to an inline data URL so the demo still works
    if (buf.length > 2 * 1024 * 1024) return bad("Uploads need a writable disk or object storage on this host");
    return ok({ url: `data:${file.type};base64,${buf.toString("base64")}` });
  }
}
