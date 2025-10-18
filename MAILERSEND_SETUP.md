# MailerSend Setup Guide

## Why MailerSend?

**SendGrid removed their free tier**, but MailerSend offers an excellent free plan:
- ✅ **12,000 emails/month free**
- ✅ Email analytics and tracking
- ✅ Template management
- ✅ Easy API integration
- ✅ No credit card required for free tier

---

## Setup Instructions

### **Step 1: Create a MailerSend Account**

1. Go to [MailerSend.com](https://www.mailersend.com/)
2. Click **"Start for free"**
3. Sign up with your email
4. Verify your email address

---

### **Step 2: Add and Verify Your Domain**

1. In MailerSend Dashboard, go to **Domains**
2. Click **"Add domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider:
   - **TXT record** for domain verification
   - **CNAME records** for email authentication (SPF, DKIM)
5. Click **"Verify domain"**

**For Development/Testing:**
- You can use the **sandbox domain** provided by MailerSend
- No domain verification needed for testing
- Emails will only be sent to verified recipients

---

### **Step 3: Get Your API Token**

1. Go to **API Tokens** in the sidebar
2. Click **"Create token"**
3. Give it a name (e.g., "SaaSavant Production")
4. Select **"Full access"** or specific permissions:
   - ✅ Email - Send
   - ✅ Email - Read
5. Click **"Create token"**
6. **Copy the token** (starts with `mlsn.`)

⚠️ **Important**: Save this token securely - you won't be able to see it again!

---

### **Step 4: Configure Your App**

Add to your `.env.local`:

```env
# MailerSend Configuration
MAILERSEND_API_KEY=mlsn.your_api_token_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
```

**For Development:**
```env
MAILERSEND_API_KEY=mlsn.your_api_token_here
MAILERSEND_FROM_EMAIL=noreply@trial-xxxxx.mlsender.net
```
(Use the sandbox domain from MailerSend dashboard)

---

### **Step 5: Verify Recipients (Development Only)**

If using the sandbox domain, you need to verify recipient emails:

1. Go to **Recipients** → **Suppression list**
2. Click **"Add recipient"**
3. Enter the email address you want to test with
4. Verify the email address

---

## Testing Your Setup

### **Test Welcome Email**

```bash
# Start your dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/sendWelcomeEmail \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### **Test Newsletter**

```bash
curl -X POST http://localhost:3000/api/sendNewsletter \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["test@example.com"],
    "subject": "Test Newsletter",
    "html": "<h1>Hello World!</h1><p>This is a test newsletter.</p>"
  }'
```

---

## Production Setup

### **1. Use Your Own Domain**

For production, always use your verified domain:
```env
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
```

### **2. Create a Production API Token**

Create a separate token for production with appropriate permissions.

### **3. Monitor Your Usage**

- Dashboard shows email statistics
- Free tier: 12,000 emails/month
- Upgrade if you need more

---

## Email Templates (Optional)

MailerSend supports email templates for better design:

1. Go to **Email Templates**
2. Create a new template
3. Use the drag-and-drop editor
4. Get the template ID
5. Update your code to use templates instead of HTML

---

## Troubleshooting

### **Emails Not Sending**

1. ✅ Check API token is correct
2. ✅ Verify domain is authenticated
3. ✅ Check recipient is verified (sandbox mode)
4. ✅ Check MailerSend dashboard for errors
5. ✅ Review server logs for error messages

### **Emails Going to Spam**

1. ✅ Verify your domain properly (SPF, DKIM, DMARC)
2. ✅ Use a professional "from" address
3. ✅ Avoid spam trigger words
4. ✅ Include unsubscribe link
5. ✅ Warm up your domain gradually

### **Rate Limits**

Free tier limits:
- **12,000 emails/month**
- **100 emails/hour** (burst)

If you hit limits, consider upgrading or implementing email queuing.

---

## Migration from SendGrid

If you're migrating from SendGrid:

1. ✅ Update environment variables
2. ✅ API routes already updated (using MailerSend SDK)
3. ✅ Test all email flows
4. ✅ Update any email templates
5. ✅ Monitor delivery rates

---

## Additional Resources

- **Documentation**: https://developers.mailersend.com/
- **API Reference**: https://developers.mailersend.com/api/v1/email.html
- **Support**: https://www.mailersend.com/help
- **Status Page**: https://status.mailersend.com/

---

## Cost Comparison

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| **MailerSend** | 12,000/month | From $25/month |
| SendGrid | ❌ None | From $15/month |
| Mailgun | 5,000/month (3 months) | From $35/month |
| Amazon SES | 62,000/month (if on AWS) | $0.10/1000 emails |

**MailerSend is the best choice for startups and small projects!** 🚀
