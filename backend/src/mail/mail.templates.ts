const xaf = (amount: number) => `${Number(amount || 0).toLocaleString('en-US')} XAF`;

/** Base responsive HTML email shell with Klass Computer branding. */
export function baseTemplate(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#0A0A0A;padding:20px 32px;">
            <span style="font-size:20px;font-weight:bold;color:#FFFFFF;">KLASS<span style="color:#CC0000;">COMPUTER</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111111;">${title}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="background:#F5F5F5;padding:20px 32px;font-size:12px;color:#555555;">
            Klass Computer — Computers &amp; Electronics<br/>
            Douala, Cameroon · <a href="https://klasscomputer.cm" style="color:#CC0000;">klasscomputer.cm</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#CC0000;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;margin:16px 0;">${label}</a>`;

export function welcomeTemplate(firstName: string, storeUrl: string) {
  return baseTemplate(
    `Welcome to Klass Computer, ${firstName}! 🎉`,
    `<p style="color:#555555;line-height:1.6;">Your account has been created. Browse the latest laptops, desktops, accessories and peripherals — with free shipping on orders above 50,000 XAF.</p>
     ${button(storeUrl + '/shop', 'Start Shopping')}`,
  );
}

export function orderConfirmationTemplate(order: any, storeUrl: string) {
  const rows = (order.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E0E0E0;color:#111111;">${item.productName} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #E0E0E0;text-align:right;color:#111111;">${xaf(item.lineTotal)}</td>
      </tr>`,
    )
    .join('');
  return baseTemplate(
    `Order confirmed — ${order.orderNumber}`,
    `<p style="color:#555555;line-height:1.6;">Thank you for your order! Here's your summary:</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
       ${rows}
       <tr><td style="padding:8px 0;color:#555555;">Subtotal</td><td style="text-align:right;color:#111111;">${xaf(order.subtotal)}</td></tr>
       ${order.discount ? `<tr><td style="padding:4px 0;color:#555555;">Discount</td><td style="text-align:right;color:#22C55E;">-${xaf(order.discount)}</td></tr>` : ''}
       <tr><td style="padding:4px 0;color:#555555;">Shipping</td><td style="text-align:right;color:#111111;">${order.shippingFee ? xaf(order.shippingFee) : 'Free'}</td></tr>
       <tr><td style="padding:8px 0;font-weight:bold;color:#111111;border-top:2px solid #111111;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#CC0000;border-top:2px solid #111111;">${xaf(order.total)}</td></tr>
     </table>
     ${button(storeUrl + '/order-tracking?order=' + order.orderNumber, 'Track Your Order')}`,
  );
}

export function orderStatusTemplate(order: any, storeUrl: string) {
  const messages: Record<string, string> = {
    processing: 'We are preparing your order.',
    shipped: `Your order is on its way!${order.trackingNumber ? ` Tracking number: <strong>${order.trackingNumber}</strong>` : ''}`,
    delivered: 'Your order has been delivered. Enjoy!',
    cancelled: 'Your order has been cancelled. Contact support if this is unexpected.',
  };
  return baseTemplate(
    `Order ${order.orderNumber} is now ${order.status}`,
    `<p style="color:#555555;line-height:1.6;">${messages[order.status] || 'Your order status has been updated.'}</p>
     ${button(storeUrl + '/order-tracking?order=' + order.orderNumber, 'View Order')}`,
  );
}

export function passwordResetTemplate(resetUrl: string) {
  return baseTemplate(
    'Reset your password',
    `<p style="color:#555555;line-height:1.6;">We received a request to reset your password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
     ${button(resetUrl, 'Reset Password')}`,
  );
}

export function newsletterTemplate(storeUrl: string) {
  return baseTemplate(
    "You're subscribed! 📬",
    `<p style="color:#555555;line-height:1.6;">Thanks for subscribing to the Klass Computer newsletter. You'll be the first to hear about new arrivals, exclusive deals and tech tips.</p>
     ${button(storeUrl + '/shop', 'Browse the Shop')}`,
  );
}
