/* ====================================================================
   PosterHub Pro — posters data (auto-loaded, no fetch needed)
   --------------------------------------------------------------------
   यही file gallery का सारा content देती है। इसे edit करके posters जोड़ें/हटाएँ।
   (posters.json भी रखा है backup के लिए — पर site इसी posters.js को पढ़ती है।)
   ==================================================================== */
window.POSTERS = {
  "site": {
    "brand": "PosterHub Pro",
    "tagline": "Ad-free • HD • Personalize",
    "url": "",
    "shareText": "PosterHub Pro से यह खूबसूरत poster 🌸 — रोज़ नए premium posters फ़्री watermark के बिना!"
  },
  "categories": [
    { "key": "good-morning", "label": "Good Morning", "icon": "🌅", "folder": "assets/good-morning",
      "posters": [ { "file": "gm1.jpg", "title": "Good Morning", "personalize": true } ] },
    { "key": "good-night", "label": "Good Night", "icon": "🌙", "folder": "assets/good-night",
      "posters": [ { "file": "gn1.jpg", "title": "Good Night", "personalize": true } ] },
    { "key": "devotional", "label": "Devotional", "icon": "🛕",
      "subs": [
        { "key": "sunday", "label": "रविवार", "folder": "assets/devotional/sunday",
          "posters": [ { "file": "sunday1.jpg", "title": "शुभ रविवार", "personalize": true } ] },
        { "key": "monday", "label": "सोमवार", "folder": "assets/devotional/monday", "posters": [] },
        { "key": "tuesday", "label": "मंगलवार", "folder": "assets/devotional/tuesday", "posters": [] },
        { "key": "wednesday", "label": "बुधवार", "folder": "assets/devotional/wednesday", "posters": [] },
        { "key": "thursday", "label": "गुरुवार", "folder": "assets/devotional/thursday", "posters": [] },
        { "key": "friday", "label": "शुक्रवार", "folder": "assets/devotional/friday", "posters": [] },
        { "key": "saturday", "label": "शनिवार", "folder": "assets/devotional/saturday", "posters": [] }
      ] },
    { "key": "festival", "label": "Festival", "icon": "🎉",
      "subs": [
        { "key": "holi", "label": "Holi", "folder": "assets/festival/holi", "posters": [] },
        { "key": "diwali", "label": "Diwali", "folder": "assets/festival/diwali",
          "posters": [ { "file": "diwali1.jpg", "title": "Happy Diwali", "personalize": true } ] }
      ] }
  ],
  "premium": [
    { "file": "prem1.jpg", "title": "Premium Floral", "folder": "assets/premium", "exclusive": true, "personalize": true },
    { "file": "prem2.jpg", "title": "Premium Devotional", "folder": "assets/premium", "exclusive": true, "personalize": true }
  ],
  "daily": {
    "base": "assets/daily",
    "days": {
      "16-06": { "label": "विशेष दिन (Demo)", "posters": [ { "file": "image1.jpg", "title": "Special" }, { "file": "image2.jpg", "title": "Special" }, { "file": "image3.jpg", "title": "Special" }, { "file": "image4.jpg", "title": "Special" } ] },
      "17-06": { "label": "Special Day", "posters": [ { "file": "image1.jpg", "title": "Special" }, { "file": "image2.jpg", "title": "Special" } ] }
    }
  }
};
