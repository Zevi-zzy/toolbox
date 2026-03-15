import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    if (signature !== digest) {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const userId = payload.meta.custom_data?.user_id;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const supabase = createServerClient();

    if (eventName === "order_created" || eventName === "subscription_created") {
      await supabase
        .from("profiles")
        .update({ tier: "pro", is_pro: true })
        .eq("id", userId);
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      await supabase
        .from("profiles")
        .update({ tier: "free", is_pro: false })
        .eq("id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
