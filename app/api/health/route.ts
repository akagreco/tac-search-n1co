export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    service: "TAC Search",
    timestamp: new Date().toISOString(),
  });
}
