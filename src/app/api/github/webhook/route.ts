import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@octokit/webhooks";
import { createAdminClient } from "@/integrations/supabase/server";

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

export async function POST(request: NextRequest) {
  const data = await request.json();

  const signature = request.headers.get("X-Hub-Signature-256");

  if (!signature) {
    return NextResponse.json(
      { error: "A signature must be provided" },
      { status: 400 }
    );
  }

  const body = await request.text();

  if (!(await webhooks.verify(body, signature))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const installationId = data.installation.id;

  const setupAction = data.action;

  const supabaseAdmin = createAdminClient();

  return NextResponse.json({ data: "GITHUB_WEBHOOK" }, { status: 200 });
}
