# PosterHub — Free Posters Website

एक static website जो GitHub Pages पर चलती है। इसमें Good Morning, Good Night, Devotional (सोमवार–रविवार) और Festival posters फ़्री download के लिए होते हैं।

Posters **random order** में दिखते हैं और **एक बार में 10** के हिसाब से (pages में) load होते हैं।

## 📁 Folder structure

```
index.html          ← मुख्य page
posters.json        ← सभी posters की list (manifest)
/assets
  /good-morning     → gm1.jpg, gm2.jpg ...
  /good-night       → gn1.jpg ...
  /devotional
    /monday ... /sunday
  /festival
    /holi  /diwali ...
```

## ➕ नया poster कैसे जोड़ें (रास्ता 1 — Manifest)

1. अपनी image (जैसे `gm2.jpg`) सही folder में डालें, उदा. `assets/good-morning/`।
2. `posters.json` खोलें और उस category के `posters` array में एक line जोड़ें:

```json
{ "file": "gm2.jpg", "title": "Good Morning" }
```

3. बस! नया poster site पर दिखने लगेगा (क्रम random रहेगा)।

- **Devotional** के लिए सही दिन के sub (monday…sunday) के `posters` में जोड़ें।
- **Festival** के लिए सही festival (holi, diwali…) के `posters` में जोड़ें।
- नया festival जोड़ना हो तो `assets/festival/` में नया folder बनाएँ और `posters.json` के festival `subs` में नया block जोड़ें।

> Note: `title` वैकल्पिक है। कोई date की ज़रूरत नहीं।

## 🚀 GitHub Pages पर publish कैसे करें

1. एक नया GitHub repository बनाएँ।
2. इस folder की सारी files (index.html, posters.json, assets/) upload करें।
3. repo की **Settings → Pages** में जाकर Source = `main branch / root` चुनें।
4. कुछ मिनट में आपकी site `https://<username>.github.io/<repo>/` पर live हो जाएगी।

## 💡 Ads

`index.html` में "Advertisement" लिखे box (ad slots) हैं। वहाँ आप अपना Google AdSense या कोई और ad code पेस्ट कर सकते हैं।

## ⭐ Pro page

यह Free users का page है। Pro users के लिए अलग page (`pro.html`) बाद में जोड़ा जाएगा।
