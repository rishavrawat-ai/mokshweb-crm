/**
 * Email template for Super Admin Discount Approval Request
 */
export function getDiscountApprovalEmailTemplate(data: {
    leadName: string;
    leadPhone: string;
    leadEmail?: string;
    salesRepName: string;
    requestedDiscount: number;
    basePriceBeforeDiscount: number;
    finalPriceAfterDiscount: number;
    reason: string;
    budgetDetails?: string;
    campaignDetails?: string;
    reviewLink: string;
}) {
    const subject = `🔔 Discount Approval Required: ${data.requestedDiscount}% for ${data.leadName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discount Approval Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Discount Approval Required</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">📋 Lead Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Customer Name:</td>
          <td style="padding: 8px 0;">${data.leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0;">${data.leadPhone}</td>
        </tr>
        ${data.leadEmail ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email:</td>
          <td style="padding: 8px 0;">${data.leadEmail}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Sales Rep:</td>
          <td style="padding: 8px 0;">${data.salesRepName}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h2 style="margin-top: 0; color: #f59e0b; font-size: 18px;">💰 Pricing Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Base Price:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px;">₹${data.basePriceBeforeDiscount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">Requested Discount:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; color: #dc2626; font-weight: 600;">${data.requestedDiscount}%</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0; font-weight: 600; font-size: 16px;">Final Price:</td>
          <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: 700; color: #059669;">₹${data.finalPriceAfterDiscount.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
      <h2 style="margin-top: 0; color: #8b5cf6; font-size: 18px;">📝 Request Details</h2>
      <p style="margin: 0;"><strong>Reason:</strong></p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 8px 0;">${data.reason}</p>
      
      ${data.budgetDetails ? `
      <p style="margin: 16px 0 0;"><strong>Budget Details:</strong></p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 8px 0;">${data.budgetDetails}</p>
      ` : ''}
      
      ${data.campaignDetails ? `
      <p style="margin: 16px 0 0;"><strong>Campaign Details:</strong></p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 8px 0;">${data.campaignDetails}</p>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.reviewLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        Review & Approve Discount
      </a>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>⚠️ Security Notice:</strong> This link is unique and expires in 24 hours. You will need to verify with an OTP sent to your email before approving.
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Moksh Promotion CRM System</p>
    <p>This is an automated email. Please do not reply.</p>
  </div>
  
</body>
</html>
  `;

    return { subject, html };
}

/**
 * Email template for OTP
 */
export function getOTPEmailTemplate(otp: string, leadName: string) {
    const subject = `🔐 Your OTP for Discount Approval: ${otp}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔐 OTP Verification</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-bottom: 20px;">Your OTP for approving the discount request for <strong>${leadName}</strong>:</p>
    
    <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #059669; font-family: 'Courier New', monospace;">
        ${otp}
      </div>
    </div>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>⚠️ Important:</strong>
      </p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #92400e; font-size: 14px;">
        <li>This OTP expires in <strong>10 minutes</strong></li>
        <li>Maximum <strong>5 attempts</strong> allowed</li>
        <li>Do not share this OTP with anyone</li>
      </ul>
    </div>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Moksh Promotion CRM System</p>
    <p>This is an automated email. Please do not reply.</p>
  </div>
  
</body>
</html>
  `;

    return { subject, html };
}

/**
 * Email template for Payment Reminder (Client)
 */
export function getClientPaymentReminderTemplate(data: {
    customerName: string;
    invoiceNo?: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: Date;
    salesRepName: string;
    salesRepPhone?: string;
    isOverdue: boolean;
}) {
    const daysOverdue = data.isOverdue
        ? Math.ceil((new Date().getTime() - data.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const subject = data.isOverdue
        ? `⚠️ Payment Overdue: ₹${data.pendingAmount.toLocaleString('en-IN')} - ${data.invoiceNo || 'Invoice'}`
        : `🔔 Payment Reminder: ₹${data.pendingAmount.toLocaleString('en-IN')} - ${data.invoiceNo || 'Invoice'}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: ${data.isOverdue ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${data.isOverdue ? '⚠️ Payment Overdue' : '🔔 Payment Reminder'}</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px;">Dear ${data.customerName},</p>
    
    <p style="font-size: 16px;">
      ${data.isOverdue
            ? `This is a reminder that your payment is <strong style="color: #dc2626;">overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}</strong>.`
            : 'This is a friendly reminder about your upcoming payment.'
        }
    </p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${data.isOverdue ? '#dc2626' : '#3b82f6'};">
      <h2 style="margin-top: 0; color: ${data.isOverdue ? '#dc2626' : '#3b82f6'}; font-size: 18px;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${data.invoiceNo ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice No:</td>
          <td style="padding: 8px 0; text-align: right;">${data.invoiceNo}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Total Amount:</td>
          <td style="padding: 8px 0; text-align: right;">₹${data.totalAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Paid Amount:</td>
          <td style="padding: 8px 0; text-align: right; color: #059669;">₹${data.paidAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 12px 0; font-weight: 600; font-size: 16px;">Pending Amount:</td>
          <td style="padding: 12px 0; text-align: right; font-size: 20px; font-weight: 700; color: ${data.isOverdue ? '#dc2626' : '#f59e0b'};">₹${data.pendingAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Due Date:</td>
          <td style="padding: 8px 0; text-align: right; ${data.isOverdue ? 'color: #dc2626; font-weight: 600;' : ''}">${data.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
      <h2 style="margin-top: 0; color: #8b5cf6; font-size: 18px;">Contact Information</h2>
      <p style="margin: 8px 0;"><strong>Sales Representative:</strong> ${data.salesRepName}</p>
      ${data.salesRepPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${data.salesRepPhone}</p>` : ''}
    </div>
    
    <p style="font-size: 16px; margin-top: 30px;">
      Please arrange for payment at your earliest convenience. If you have already made the payment, please ignore this reminder.
    </p>
    
    <p style="font-size: 16px;">
      For any queries, please contact ${data.salesRepName}${data.salesRepPhone ? ` at ${data.salesRepPhone}` : ''}.
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Moksh Promotion</p>
    <p>Thank you for your business!</p>
  </div>
  
</body>
</html>
  `;

    return { subject, html };
}

/**
 * Email template for Internal Payment Reminder (Sales/Finance)
 */
export function getInternalPaymentReminderTemplate(data: {
    leadName: string;
    leadPhone: string;
    invoiceNo?: string;
    pendingAmount: number;
    dueDate: Date;
    status: string;
    lastFollowupNote?: string;
    clientCommitmentDate?: Date;
    isOverdue: boolean;
}) {
    const subject = `💼 Payment Follow-up: ${data.leadName} - ₹${data.pendingAmount.toLocaleString('en-IN')}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internal Payment Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">💼 Payment Follow-up Required</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Lead Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Customer:</td>
          <td style="padding: 8px 0;">${data.leadName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0;">${data.leadPhone}</td>
        </tr>
        ${data.invoiceNo ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice:</td>
          <td style="padding: 8px 0;">${data.invoiceNo}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0;"><span style="background: ${data.isOverdue ? '#fee2e2' : '#fef3c7'}; color: ${data.isOverdue ? '#dc2626' : '#f59e0b'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${data.status}</span></td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h2 style="margin-top: 0; color: #f59e0b; font-size: 18px;">Payment Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Pending Amount:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: 700; color: #dc2626;">₹${data.pendingAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Due Date:</td>
          <td style="padding: 8px 0; text-align: right;">${data.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>
        ${data.clientCommitmentDate ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Client Commitment:</td>
          <td style="padding: 8px 0; text-align: right; color: #8b5cf6; font-weight: 600;">${data.clientCommitmentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    ${data.lastFollowupNote ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
      <h2 style="margin-top: 0; color: #10b981; font-size: 18px;">Last Follow-up Note</h2>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 8px 0;">${data.lastFollowupNote}</p>
    </div>
    ` : ''}
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Action Required:</strong> Please follow up with the client regarding this payment.
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Moksh Promotion CRM System</p>
    <p>This is an automated reminder.</p>
  </div>
  
</body>
</html>
  `;

    return { subject, html };
}
