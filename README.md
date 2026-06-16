# PosterHub — Free Posters Website

एक fast, SEO-ready static website जो GitHub Pages पर चलती है। Good Morning, Good Night, Devotional (सोमवार–रविवार) और Festival posters फ़्री download और share के लिए।

- Posters **random order** में दिखते हैं, **All tab** default है (सभी category एक साथ)।
- हर image पर **watermark** (ऊपर center, 50% opacity) — download की गई image में भी जुड़ता है।
- हर image के नीचे **WhatsApp / Facebook / Instagram / X** share buttons।
- Single category में **10 posters per page** + pagination।

## 📁 Folder structure

```
index.html          ← मुख्य page (free users)
posters.json        ← सभी posters की list (manifest)
robots.txt          ← SEO crawler instructions
sitemap.xml         ← SEO sitemap
site.webmanifest    ← PWA / browser manifest
/assets
  /good-morning     → gm1.jpg ...
  /good-night       → gn1.jpg ...
  /devotional/{monday..sunday}
  /festival/{holi,diwali}
```

## ➕ नया poster जोड़ना (रास्ता 1 — Manifest)

1. image सही folder में डालें (जैसे `assets/good-morning/gm2.jpg`)।
2. `posters.json` में उस category के `posters` array में जोड़ें:

```json
{ "file": "gm2.jpg", "title": "Good Morning" }
```

3. बस! कोई date की ज़रूरत नहीं। Devotional के लिए सही दिन (monday…sunday) और Festival के लिए सही festival sub में जोड़ें।

### Brand / watermark / share text
`posters.json` के `site` block से control होता है:
```json
"site": {
  "brand": "PosterHub",
  "tagline": "...",
  "url": "",            // अपनी live website URL यहाँ डालें (share के लिए)
  "shareText": "...",   // share पर जाने वाला about text
  "watermark": "PosterHub" // न हो तो brand use होगा
}
```

## 🚀 GitHub Pages पर publish

1. नया GitHub repository बनाएँ और इस folder की सारी files upload करें।
2. **Settings → Pages** में Source = `main / root` चुनें।
3. कुछ मिनट में site `https://<username>.github.io/<repo>/` पर live हो जाएगी।

## 🔎 SEO setup (ज़रूरी)

Live URL मिलने के बाद इन जगहों पर `https://posterhub.example.com/` को अपनी असली URL से बदलें:

- `index.html` — `canonical`, `og:url`, `og:image`, `twitter:image`, और तीनों JSON-LD blocks।
- `robots.txt` — Sitemap line।
- `sitemap.xml` — दोनों `<loc>` URLs।
- `posters.json` — `site.url`।

फिर [Google Search Console](https://search.google.com/search-console) में site verify करके `sitemap.xml` submit कर दें।

### शामिल SEO features
- Title + meta description + keywords
- Open Graph + Twitter Card tags (social preview)
- JSON-LD: WebSite + SearchAction, Organization, FAQPage
- Semantic HTML, image alt text, FAQ section
- robots.txt + sitemap.xml + web manifest + theme-color + favicon

## 💡 Ads
"Advertisement" वाले box में अपना Google AdSense code पेस्ट करें।

## ⭐ Pro page
यह Free users का page है। Pro users के लिए अलग `pro.html` बाद में जोड़ा जाएगा।
