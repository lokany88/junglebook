export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return new Response("ok");
  }
  return new Response("unauthorized", { status: 401 });
}

