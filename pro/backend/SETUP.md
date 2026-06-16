# PosterHub Pro — Backend Setup (Google Sheet + Apps Script)

Pro version का login और subscription Google Sheet + Apps Script से चलता है। कोई server/hosting खर्च नहीं।

## स्टेप (एक बार)

1. **Google Sheet बनाएँ** — https://sheets.new (नाम: PosterHub Pro DB)
2. ऊपर menu में **Extensions → Apps Script** खोलें।
3. वहाँ जो default `Code.gs` है उसे पूरा मिटाकर इस folder का **`Code.gs`** copy-paste करें।
4. ऊपर दो चीज़ें बदलें:
   - `SALT` — कोई भी गुप्त random शब्द (password security के लिए)
   - `ADMIN_KEY` — आपका admin password (यही `admin.html` में डालेंगे)
5. ऊपर function dropdown से **`setup`** चुनकर **Run** दबाएँ → permissions मांगे तो Allow करें। (इससे Users और Payments sheet बन जाएंगे।)
6. **Deploy → New deployment →** gear icon → **Web app**
   - Description: PosterHub Pro
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** दबाएं → मिला **Web app URL** copy करें।
7. वह URL `config.js` के **`API_URL`** में paste करें।
8. `admin.html` खोलें → अपना `ADMIN_KEY` डालें → pending payments दिखेंगे।

## कैसे काम करता है

- **Signup/Login** → Users sheet में row बनता है (password SHA-256 + SALT से hash होकर)। Signup में अब **WhatsApp number ज़रूरी** है — यह Users sheet के WhatsApp column में save होता है और `admin.html` में हर user के सामने दिखता है (एक tap में WhatsApp chat खुलती है)।
- **Payment** → user UPI से pay करके Transaction ID डालता है → Payments sheet में `pending` आता है।
- **Aap (admin)** → `admin.html` खोलकर payment verify करें → **Approve** दबाएँ → उस user का plan 30 दिन के लिए active हो जाता है।
- Plan expiry अपने-आप check होती है (30 दिन बाद expired)।

## ज़रूरी बातें

- Deployment **Anyone** होना ज़रूरी है वरना website से fetch fail होगा।
- Browser CORS से बचने के लिए frontend `Content-Type: text/plain` भेजता है — यह normal है, छेड़ें नहीं।
- जब भी `Code.gs` बदलें, दोबारा **Deploy → Manage deployments → Edit → New version** करना होगा।
- ⚠️ **WhatsApp column नया जुड़ा है** — अगर आपने पहले पुराना `Code.gs` चला लिया था और Users sheet पहले से बनी है, तो उस पुरानी **Users sheet को delete करके दोबारा `setup` Run करें** (वरना columns आगे-पीछे हो जाएंगे)। नई शुरुआत में सीधे `setup` चलाएँ।
- Users sheet के columns का क्रम: **Email, Hash, Name, WhatsApp, Token, Plan, Expiry, Status, Created**।
- Payment auto-verify नहीं है — आप manually approve करते हैं (छोटे scale के लिए सबसे सुरक्षित और free तरीका)।
