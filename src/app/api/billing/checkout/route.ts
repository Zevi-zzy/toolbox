import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-server";
import { setupLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId } = await req.json();
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

    if (!storeId || !variantId) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
    }

    setupLemonSqueezy();

    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${new URL(req.url).origin}/dashboard`,
      },
    });

    return NextResponse.json({ url: checkout.data?.data.attributes.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
