export const PYTHON_API_URL =
  process.env.PYTHON_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export type JobStatus = "queued" | "processing" | "done" | "error";

export type JobOptions = {
  spectral: boolean;
  humanizer: boolean;
  phase: boolean;
  watermark: boolean;
  mastering?: boolean;
  adaptive?: boolean;
  loudness_match?: boolean;
  intensity: number;
};

export type JobRecord = {
  id: string;
  status: JobStatus;
  progress: number;
  stage: string;
  error: string | null;
  duration_ms: number | null;
  sample_rate: number | null;
  output_size_bytes: number | null;
  options: JobOptions;
  content_type: string | null;
  content_confidence: number | null;
  input_loudness_db: number | null;
  output_loudness_db: number | null;
  module_intensities: Record<string, number>;
  created_at: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export async function submitJob(
  file: Blob,
  filename: string,
  options: JobOptions
): Promise<{ job_id: string; status: JobStatus }> {
  const form = new FormData();
  form.append("file", file, filename);
  form.append("options", JSON.stringify(options));

  const res = await fetchWithTimeout(`${PYTHON_API_URL}/process`, {
    method: "POST",
    body: form,
    timeoutMs: 120_000,
  });

  if (!res.ok) {
    const text = await safeText(res);
    throw new Error(`python /process failed (${res.status}): ${text}`);
  }
  return (await res.json()) as { job_id: string; status: JobStatus };
}

export async function getJob(jobId: string): Promise<JobRecord> {
  const res = await fetchWithTimeout(`${PYTHON_API_URL}/jobs/${jobId}`);
  if (res.status === 404) {
    throw new JobNotFoundError(jobId);
  }
  if (!res.ok) {
    throw new Error(`python /jobs/${jobId} failed (${res.status})`);
  }
  return (await res.json()) as JobRecord;
}

export async function downloadJob(jobId: string): Promise<Response> {
  return fetchWithTimeout(`${PYTHON_API_URL}/jobs/${jobId}/download`, {
    timeoutMs: 60_000,
  });
}

export class JobNotFoundError extends Error {
  constructor(public readonly jobId: string) {
    super(`job ${jobId} not found`);
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
