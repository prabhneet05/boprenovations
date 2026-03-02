# SETUP GUIDE: Netlify + Gmail + WhatsApp Integration

## Overview
This guide sets up your contact form to:
- ✅ Collect form submissions
- ✅ Send emails to business AND customers (via Gmail)
- ✅ Include WhatsApp direct message links
- ✅ All COMPLETELY FREE

---

## STEP 1: Set Up Gmail App Password

### Why App Password?
Gmail requires a special "App Password" for third-party apps. It's more secure than your regular password.

### Steps:

1. Go to your Gmail account: https://myaccount.google.com

2. Click **Security** (left menu)

3. Scroll down and enable **2-Step Verification** if not already enabled
   - You'll receive a code on your phone

4. After enabling 2-Step Verification, look for **App passwords**
   - Go back to Security → App passwords
   - Select: App = **Mail**, Device = **Windows Computer** (or your device)
   - Click **Generate**

5. Copy the 16-character password shown (it will have spaces, remove them)
   - Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

6. Keep this password safe - you'll need it next

---

## STEP 2: Create .env File (Environment Variables)

### Local Development:

1. In your project root (`c:\Projects\boprenovations\`), create a file named `.env`

2. Add this content:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-16-character-app-password
BUSINESS_EMAIL=info@boprenovations.co.nz
```

3. Replace:
   - `your-email@gmail.com` with YOUR Gmail address
   - `your-16-character-app-password` with the 16-char password from Step 1

### Example:
```
GMAIL_USER=john.doe@gmail.com
GMAIL_PASSWORD=wxyzabcdefghijkl
BUSINESS_EMAIL=info@boprenovations.co.nz
```

---

## STEP 3: Set Up Netlify

### 3A: Connect Repository to Netlify

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Add Netlify functions for contact form"
git remote add origin https://github.com/YOUR_USERNAME/boprenovations.git
git push -u origin main
```

2. Go to https://app.netlify.com

3. Click **Add new site** → **Import an existing project**

4. Choose **GitHub** and authorize

5. Select your `boprenovations` repository

6. Build settings should auto-detect:
   - Build command: Leave empty (or `npm install`)
   - Publish directory: `.` (current folder)

7. Click **Deploy site**

### 3B: Set Environment Variables in Netlify

1. In Netlify dashboard, go to your site

2. Click **Site settings** → **Build & deploy** → **Environment**

3. Click **Edit variables**

4. Add these variables:
   - Key: `GMAIL_USER` | Value: `your-email@gmail.com`
   - Key: `GMAIL_PASSWORD` | Value: `your-16-char-password`
   - Key: `BUSINESS_EMAIL` | Value: `info@boprenovations.co.nz`

5. Save and redeploy your site

⚠️ **IMPORTANT**: Never commit `.env` to GitHub. Add to `.gitignore`:
```
.env
.env.local
node_modules/
```

---

## STEP 4: Test the Form

1. Go to your site: `https://your-site.netlify.app/contact-us.html`

2. Fill out the form and submit

3. You should receive:
   - ✅ Confirmation email at your personal email
   - ✅ Customer email at the form submitter's email
   - ✅ Both emails include WhatsApp link

### Troubleshooting:

If emails don't arrive:
- Check Gmail Settings → Apps & services → **Less secure apps** (if needed)
- Or use the Gmail App Password method (recommended ✓)
- Check Netlify function logs: **Functions** → **send-enquiry** → View logs

---

## STEP 5: WhatsApp Integration (OPTIONAL)

### Option A: Direct WhatsApp Links (Automatic ✓)
The form already includes WhatsApp links! Users see:
- WhatsApp link in confirmation emails
- Click to open WhatsApp Web/Mobile chat

### Option B: WhatsApp Business API (Advanced)
To send automated messages TO users:
1. Set up Meta WhatsApp Business API
2. Requires business verification
3. More complex setup (optional)

For now, **Option A is enabled automatically** 🎉

---

## STEP 6: Monitor & Maintain

### Check Form Submissions:
1. Netlify dashboard → **Forms** section
2. See all submissions with timestamps
3. Download data as CSV

### Monitor Function Logs:
1. Netlify dashboard → **Functions** → **send-enquiry**
2. View real-time logs for debugging

### Email Notifications:
Set up Netlify form notifications:
1. Site settings → **Forms** → **Form notifications**
2. Add email to get alerts

---

## COSTS BREAKDOWN

| Service | Cost | Usage |
|---------|------|-------|
| Netlify | Free tier | 125,000 function calls/month ✓ |
| Gmail | Free | Unlimited emails ✓ |
| WhatsApp (Links) | Free | Direct messaging link ✓ |
| **TOTAL** | **$0** | Completely FREE |

---

## File Structure

```
boprenovations/
├── netlify/
│   └── functions/
│       └── send-enquiry.js         (Handles form submissions)
├── assets/
│   ├── css/style.css
│   └── js/main.js                  (Updated form handler)
├── contact-us.html                 (Updated form)
├── package.json                    (Node dependencies)
├── netlify.toml                    (Configuration)
├── .env                            (Environment variables - DO NOT COMMIT)
├── .env.example                    (Template for .env)
└── .gitignore                      (Hide .env from Git)
```

---

## What Happens When Someone Submits the Form?

```
User fills form → Click Submit
      ↓
JavaScript sends data to Netlify Function
      ↓
Function validates data
      ↓
Send email to BUSINESS (info@boprenovations.co.nz)
      ↓
Send confirmation email to CUSTOMER
      ↓
Both emails include WhatsApp link
      ↓
User sees success message
```

---

## QUICK CHECKLIST

- [ ] Created `.env` file with Gmail credentials
- [ ] Pushed code to GitHub
- [ ] Created Netlify site from GitHub
- [ ] Added environment variables to Netlify dashboard
- [ ] Deployed site
- [ ] Test form submission
- [ ] Received email confirmations
- [ ] Share site with customers!

---

## Support

**Common Issues:**

1. **Emails not sending:**
   - Verify Gmail App Password is correct
   - Check Netlify function logs for errors

2. **Function timeout:**
   - Gmail might be slow - increase timeout in netlify.toml

3. **WhatsApp link not working:**
   - Ensure phone number format: `+64276251313`
   - Must have `+` prefix

---

## Next Steps

Once setup is complete:
1. Test form thoroughly
2. Set up email forwarding (info@boprenovations.co.nz → your Gmail)
3. Add analytics tracking
4. Set up Netlify form notifications
5. Monitor customer inquiries regularly

Good luck! 🚀
