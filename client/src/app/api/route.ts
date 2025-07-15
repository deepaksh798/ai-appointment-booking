export const runtime = "edge"; // Keep this if you're deploying on Edge

export async function POST(request: Request, context: any) {
  const data = await request.json();
  const logs = data.message?.toolCalls;

  if (!logs) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await context.env.APPOINTMENT_KV.put("appointment:id", JSON.stringify(logs));

  return new Response(JSON.stringify({ message: "Saved!" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: Request, context: any) {
  const value = await context.env.APPOINTMENT_KV.get("appointment:id");

  if (!value) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  await context.env.APPOINTMENT_KV.delete("appointment:id");

  return new Response(
    JSON.stringify({
      message: "Fetched successfully",
      data: JSON.parse(value),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
