import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) return jsonResponse({ error: "orderId required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Fetch order + items
    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });
    const orders = await orderRes.json();
    const order = orders?.[0];
    if (!order) return jsonResponse({ error: "Order not found" }, 404);

    const itemsRes = await fetch(
      `${supabaseUrl}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    const items = await itemsRes.json();

    // Build email content
    const itemsHtml = (items as Array<Record<string, unknown>>)
      .map(
        (it) =>
          `<tr><td style="padding:6px;border:1px solid #ddd">${it.product_name}</td>` +
          `<td style="padding:6px;border:1px solid #ddd">${it.size ?? ""} / ${it.color ?? ""}</td>` +
          `<td style="padding:6px;border:1px solid #ddd;text-align:center">${it.quantity}</td>` +
          `<td style="padding:6px;border:1px solid #ddd;text-align:right">${Number(it.price).toFixed(2)} DT</td></tr>`,
      )
      .join("");

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1a1a1f">
      <h1>Nouvelle commande — ${order.order_number}</h1>
      <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString("fr-FR")}</p>
      <h2>Client</h2>
      <p>
        ${order.first_name} ${order.last_name}<br/>
        Téléphone: ${order.phone}<br/>
        ${order.email ? `Email: ${order.email}<br/>` : ""}
        Adresse: ${order.address}, ${order.city}, ${order.governorate} ${order.postal_code ?? ""}<br/>
        ${order.note ? `Remarque: ${order.note}` : ""}
      </p>
      <h2>Produits</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr style="background:#f6f6f7">
          <th style="padding:6px;border:1px solid #ddd;text-align:left">Produit</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:left">Taille/Couleur</th>
          <th style="padding:6px;border:1px solid #ddd">Qté</th>
          <th style="padding:6px;border:1px solid #ddd;text-align:right">Prix</th>
        </tr>
        ${itemsHtml}
      </table>
      <h2>Récapitulatif</h2>
      <p>Sous-total: ${Number(order.subtotal).toFixed(2)} DT<br/>
      Livraison: ${Number(order.shipping_fee).toFixed(2)} DT<br/>
      ${Number(order.discount) > 0 ? `Remise: -${Number(order.discount).toFixed(2)} DT<br/>` : ""}
      <strong>Total: ${Number(order.total).toFixed(2)} DT</strong></p>
      <p style="color:#85858f">Paiement à la livraison (Cash on Delivery)</p>
    </body></html>`;

    // Send admin email via Resend (if configured) — otherwise log
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "admin@tunisia.tn";

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TUNISIA Boutique <noreply@tunisia.tn>",
          to: [adminEmail],
          subject: `Nouvelle commande — ${order.order_number}`,
          html,
        }),
      });

      // Customer confirmation if email provided
      if (order.email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TUNISIA Boutique <noreply@tunisia.tn>",
            to: [order.email],
            subject: `Confirmation de commande — ${order.order_number}`,
            html: `<html><body style="font-family:Arial,sans-serif">
              <h1>Merci pour votre commande, ${order.first_name}!</h1>
              <p>Votre commande <strong>${order.order_number}</strong> a bien été reçue.</p>
              <p>Nous vous contacterons rapidement pour confirmer la livraison.</p>
              <p>Total: <strong>${Number(order.total).toFixed(2)} DT</strong> (Paiement à la livraison)</p>
              <p style="color:#85858f">TUNISIA — Boutique de mode en ligne</p>
            </body></html>`,
          }),
        });
      }
    }

    return jsonResponse({ success: true, orderNumber: order.order_number });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
