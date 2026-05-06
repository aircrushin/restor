import { downloadJob, getJob, JobNotFoundError } from "@/lib/python-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const wantsDownload = url.searchParams.get("download") === "1";

  if (wantsDownload) {
    try {
      const upstream = await downloadJob(id);
      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        return Response.json(
          { error: text || `download failed (${upstream.status})` },
          { status: upstream.status }
        );
      }
      const headers = new Headers();
      headers.set("Content-Type", upstream.headers.get("content-type") ?? "audio/wav");
      headers.set(
        "Content-Disposition",
        upstream.headers.get("content-disposition") ?? `attachment; filename="deai-${id}.wav"`
      );
      const len = upstream.headers.get("content-length");
      if (len) headers.set("Content-Length", len);
      return new Response(upstream.body, { status: 200, headers });
    } catch (err) {
      const message = err instanceof Error ? err.message : "download failed";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  try {
    const job = await getJob(id);
    return Response.json(job);
  } catch (err) {
    if (err instanceof JobNotFoundError) {
      return Response.json({ error: "job not found" }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "status fetch failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
