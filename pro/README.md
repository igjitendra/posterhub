# PosterHub Pro (Advance Version)

Free site से अलग — यह **paid / premium** version है। इसे अलग host करें।

## Plans

| Plan | कीमत | क्या मिलता है |
|------|------|-------------|
| **Poster Plus** | ₹30/month | कोई ads नहीं, तुरंत HD download, सभी Daily posters, ऊपर साफ़ brand पट्टी |
| **Advance Plus** | ₹49/month | सबकुछ + Exclusive premium packs, early access, फ़ोटो+नाम personalize, Full HD/4K |

## Files

```
posterhub-pro/
  index.html        # main site
  styles.css        # dark pro theme
  app.js            # पूरा frontend logic (auth, plans, pay, editor, gallery)
  config.js         # ⚠️ इसमें API_URL डालना है (UPI ID पहले से सेट)
  posters.json      # poster list (इसे edit करके posters जोड़ें)
  admin.html        # payment approve/reject panel
  robots.txt        # search engine block (paid site)
  assets/           # सभी poster images
  backend/
    Code.gs         # Google Apps Script (Sheet backend)
    SETUP.md        # backend लगाने की पूरी गाइड
```

## शुरू कैसे करें

1. `backend/SETUP.md` पढ़कर Google Apps Script deploy करें → Web App URL लें।
2. **`config.js` में `API_URL` पहले से आपके deploy किए गए URL पर सेट है** (UPI ID `6387617678-2@okbizaxis` भी सेट है)। अगर आप दोबारा deploy करके नया URL बनाएँ, तो वही नया URL `config.js` के `API_URL` में डाल दें।

> **नोट:** Signup में अब **WhatsApp number ज़रूरी** है और login **localStorage में हमेशा के लिए save** रहता है (दोबारा login नहीं करना पड़ता)।
3. पूरा `posterhub-pro/` folder किसी भी static host (Netlify / Vercel / अपना hosting) पर डाल दें।
4. `config.js` में `SITE_URL` में अपना domain डालें (share links सही बनेंगे)।

## Posters जोड़ना (`posters.json`)

- **साधारण poster** — `categories` में सही category के `posters` में `{ "file": "x.jpg", "title": "...", "personalize": true }`।
- **Premium / exclusive (Advance only)** — `premium` array में `{ "file":"...", "folder":"assets/premium", "exclusive": true }`।
- **personalize: true** → उस poster पर "अपनी फ़ोटो लगाएँ" button आएगा (सिर्फ Advance Plus user को)।
- **Daily posters** — `daily.days` में दिन `DD-MM` format में, जैसे `"16-06"`। Images: `assets/daily/16-06/image1.jpg` ...।

## Watermark / पट्टी (strips)

- Image के ऊपर **extra सफ़ेद पट्टी** में website का नाम (image के ऊपर नहीं, बाहर जुड़ता है)।
- Personalize download में **नीचे एक और सफ़ेद पट्टी** — white background, black text — जिसमें user का profile name होता है।
- दोनों पट्टियाँ image के साथ मिलाकर एक ही picture बनकर download होती हैं।

## नोट

- Payment verify manual है (admin approve करता है) — सबसे सस्ता + सुरक्षित।
- Static hosting में premium image URL पूरी तरह छिपाई नहीं जा सकती (soft gate)। पूरी सुरक्षा चाहिए तो आगे paid server चाहिए।
