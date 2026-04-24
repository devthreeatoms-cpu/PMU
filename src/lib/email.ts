import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "PMU SUPPLY <onboarding@resend.dev>";

export async function sendOrderConfirmationEmail(order: any) {
  const { id, total, items, shippingAddress } = order;
  
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f4;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${item.productName}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f4; text-align: right;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">₹${item.priceAtPurchase.toFixed(2)}</p>
      </td>
    </tr>
  `).join("");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Confirmed: Your PMU SUPPLY Order ${id}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #000; padding: 40px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">PMU SUPPLY</h1>
            <p style="color: #fff; margin-top: 10px; font-size: 12px; letter-spacing: 1px; opacity: 0.8;">ELITE PROFESSIONAL EQUIPMENT</p>
          </div>
          
          <div style="padding: 40px; background-color: #fff; border: 1px solid #eee;">
            <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 20px;">Order Confirmed</h2>
            <p style="font-size: 14px; color: #666;">Thank you for your professional trust. Your order is being prepared with clinical care.</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
              <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600; color: #C9A84C;">${id}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 10px;">Item</th>
                  <th style="text-align: right; font-size: 10px; text-transform: uppercase; color: #999; padding-bottom: 10px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding-top: 20px; font-size: 14px; font-weight: 700;">Total Investment</td>
                  <td style="padding-top: 20px; font-size: 18px; font-weight: 700; text-align: right; color: #000;">₹${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 30px;">
              <h3 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Shipping Logistics</h3>
              <p style="font-size: 13px; color: #666; margin: 0;">
                ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
                ${shippingAddress.address}<br>
                ${shippingAddress.city}, ${shippingAddress.zipCode}<br>
                ${shippingAddress.country}
              </p>
            </div>
          </div>

          <div style="padding: 30px; text-align: center; font-size: 12px; color: #999;">
            <p>© 2026 PMU SUPPLY. All rights reserved.</p>
            <p>You are receiving this because you placed an order on PMU SUPPLY.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}

export async function sendShippingUpdateEmail(order: any) {
  const { id, shippingAddress } = order;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Your PMU SUPPLY Package is on the Way!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #000; padding: 40px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">PMU SUPPLY</h1>
          </div>
          
          <div style="padding: 40px; background-color: #fff; border: 1px solid #eee;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; padding: 15px; background-color: #f0fdf4; border-radius: 50%; margin-bottom: 20px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <h2 style="font-size: 24px; font-weight: 400; margin: 0;">Order Shipped</h2>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">Exciting news! Your professional assets have left our warehouse.</p>
            </div>
            
            <div style="margin: 30px 0; padding: 25px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Tracking Order</p>
              <p style="margin: 10px 0; font-size: 18px; font-weight: 700; color: #000;">${id}</p>
              <p style="font-size: 12px; color: #666; margin-top: 15px;">You can track your package details in your professional profile.</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
              <a href="https://pmusupply.com/profile" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">View Order Status</a>
            </div>
          </div>

          <div style="padding: 30px; text-align: center; font-size: 12px; color: #999;">
            <p>© 2026 PMU SUPPLY. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
export async function sendOrderStatusUpdateEmail(order: any) {
  const { id, status, shippingAddress } = order;
  const statusUpper = status.charAt(0).toUpperCase() + status.slice(1);

  let statusMessage = "Your order status has been updated.";
  let statusIcon = "📋";

  if (status === "processing") {
    statusMessage = "Our specialists are currently preparing your assets.";
    statusIcon = "⚙️";
  } else if (status === "shipped") {
    statusMessage = "Your package has left our fulfillment center.";
    statusIcon = "🚚";
  } else if (status === "delivered") {
    statusMessage = "Your package has been successfully delivered.";
    statusIcon = "✅";
  } else if (status === "cancelled") {
    statusMessage = "Your order has been cancelled. Please contact support for details.";
    statusIcon = "❌";
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [shippingAddress.email],
      subject: `Update: PMU SUPPLY Order ${id} is now ${statusUpper}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #000; padding: 40px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">PMU SUPPLY</h1>
          </div>
          
          <div style="padding: 40px; background-color: #fff; border: 1px solid #eee;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 40px; margin-bottom: 10px;">${statusIcon}</div>
              <h2 style="font-size: 24px; font-weight: 400; margin: 0;">Order ${statusUpper}</h2>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">${statusMessage}</p>
            </div>
            
            <div style="margin: 30px 0; padding: 25px; border: 1px solid #eee; border-radius: 12px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Order ID</p>
              <p style="margin: 10px 0; font-size: 18px; font-weight: 700; color: #000;">${id}</p>
              <p style="font-size: 12px; color: #C9A84C; font-weight: 600; margin-top: 15px;">New Status: ${statusUpper}</p>
            </div>
          </div>
          <div style="padding: 30px; text-align: center; font-size: 12px; color: #999;">
            <p>© 2026 PMU SUPPLY. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Resend Error:", error);
    return { success: false, error };
  }
}
