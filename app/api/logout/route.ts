import { NextResponse } from "next/server";

import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();

  // Location relativo evita usar o host interno (localhost:10000) atrás do proxy do Render.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/login" },
  });
}
