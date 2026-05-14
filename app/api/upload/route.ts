import { submitJob, type JobOptions } from "@/lib/python-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCEPTED_MIME = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/ogg",
  "audio/aac",
  "audio/x-m4a",
  "audio/mp4",
]);

const MAX_BYTES = 60 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "missing file field" }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `file too large; max ${MAX_BYTES / (1024 * 1024)}MB` },
      { status: 413 }
    );
  }
  if (file.type && !ACCEPTED_MIME.has(file.type)) {
    return Response.json(
      { error: `unsupported audio type: ${file.type}` },
      { status: 415 }
    );
  }

  const optionsRaw = formData.get("options");
  const options = parseOptions(typeof optionsRaw === "string" ? optionsRaw : null);

  try {
    const result = await submitJob(file, file.name || "upload.wav", options);
    return Response.json(result, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "python worker unreachable";
    return Response.json({ error: message }, { status: 502 });
  }
}

function parseOptions(raw: string | null): JobOptions {
  const fallback: JobOptions = {
    spectral: true,
    humanizer: true,
    phase: true,
    watermark: false,
    mastering: false,
    intensity: 0.6,
  };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<JobOptions>;
    return {
      spectral: parsed.spectral ?? fallback.spectral,
      humanizer: parsed.humanizer ?? fallback.humanizer,
      phase: parsed.phase ?? fallback.phase,
      watermark: parsed.watermark ?? fallback.watermark,
      mastering: parsed.mastering ?? fallback.mastering,
      intensity: clamp01(parsed.intensity ?? fallback.intensity),
    };
  } catch {
    return fallback;
  }
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.6;
  return Math.min(1, Math.max(0, n));
}
