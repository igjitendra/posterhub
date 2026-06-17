/* ====================================================================
   PosterHub Pro — posters data (auto-loaded, no fetch needed)
   --------------------------------------------------------------------
   यही file gallery का सारा content देती है।
   हर category में 10–20 posters, और daily में पूरे साल (365+ दिन) की 10-10 entry।

   ⚠️ Image नाम का नियम (GitHub Pages case-sensitive है):
     good-morning : assets/good-morning/gm50.jpg ... gm1.jpg
     good-night   : assets/good-night/gn1.jpg ... gn15.jpg
     devotional   : assets/devotional/<din>/<din>1.jpg ... <din>10.jpg   (sunday1.jpg आदि)
     festival     : assets/festival/holi/holi1.jpg , assets/festival/diwali/diwali1.jpg ...
     premium      : assets/premium/prem1.jpg ... prem12.jpg
     daily        : assets/daily/DD-MM/image1.jpg ... image10.jpg   (जैसे assets/daily/17-06/image1.jpg)
   जिस din/poster की image नहीं होगी, वहाँ placeholder दिखेगा (site नहीं टूटेगी)।
   ==================================================================== */
(function () {
  // helper: prefix1.jpg ... prefixN.jpg की list बनाता है
  function mk(prefix, n, opts) {
    opts = opts || {};
    var arr = [];
    for (var i = 1; i <= n; i++) {
      var o = { file: prefix + i + ".jpg", title: opts.title || "Poster" };
      if (opts.personalize) o.personalize = true;
      if (opts.exclusive) o.exclusive = true;
      if (opts.folder) o.folder = opts.folder;
      arr.push(o);
    }
    return arr;
  }

  /* ---------- DAILY: पूरे साल के हर दिन की 10-10 entry ---------- */
  var months = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  var daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Feb 29 भी शामिल
  var days = {};
  for (var m = 0; m < 12; m++) {
    for (var d = 1; d <= daysInMonth[m]; d++) {
      var dd = ("0" + d).slice(-2);
      var mm = ("0" + (m + 1)).slice(-2);
      var label = d + " " + months[m];
      var posters = [];
      for (var i = 1; i <= 10; i++) {
        posters.push({ file: "image" + i + ".jpg", title: label });
      }
      days[dd + "-" + mm] = { label: label, posters: posters };
    }
  }

  window.POSTERS = {
    site: {
      brand: "PosterHub Pro",
      tagline: "Ad-free • HD • Personalize",
      url: "",
      shareText: "PosterHub Pro से यह खूबसूरत poster 🌸 — रोज़ नए premium posters फ़्री watermark के बिना!"
    },
    categories: [
      { key: "good-morning", label: "Good Morning", icon: "🌅", folder: "assets/good-morning",
        posters: mk("gm", 50, { title: "Good Morning", personalize: true }) },

      { key: "good-night", label: "Good Night", icon: "🌙", folder: "assets/good-night",
        posters: mk("gn", 15, { title: "Good Night", personalize: true }) },

      { key: "devotional", label: "Devotional", icon: "🛕",
        subs: [
          { key: "sunday",    label: "रविवार",  folder: "assets/devotional/sunday",    posters: mk("sunday", 10,    { title: "शुभ रविवार",  personalize: true }) },
          { key: "monday",    label: "सोमवार",  folder: "assets/devotional/monday",    posters: mk("monday", 10,    { title: "शुभ सोमवार",  personalize: true }) },
          { key: "tuesday",   label: "मंगलवार", folder: "assets/devotional/tuesday",   posters: mk("tuesday", 10,   { title: "शुभ मंगलवार", personalize: true }) },
          { key: "wednesday", label: "बुधवार",  folder: "assets/devotional/wednesday", posters: mk("wednesday", 10, { title: "शुभ बुधवार",  personalize: true }) },
          { key: "thursday",  label: "गुरुवार", folder: "assets/devotional/thursday",  posters: mk("thursday", 10,  { title: "शुभ गुरुवार", personalize: true }) },
          { key: "friday",    label: "शुक्रवार", folder: "assets/devotional/friday",    posters: mk("friday", 10,    { title: "शुभ शुक्रवार", personalize: true }) },
          { key: "saturday",  label: "शनिवार",  folder: "assets/devotional/saturday",  posters: mk("saturday", 10,  { title: "शुभ शनिवार",  personalize: true }) }
        ] },

      { key: "festival", label: "Festival", icon: "🎉",
        subs: [
          { key: "holi",   label: "Holi",   folder: "assets/festival/holi",   posters: mk("holi", 10,   { title: "Happy Holi",   personalize: true }) },
          { key: "diwali", label: "Diwali", folder: "assets/festival/diwali", posters: mk("diwali", 10, { title: "Happy Diwali", personalize: true }) }
        ] }
    ],

    premium: mk("prem", 12, { title: "Premium Poster", folder: "assets/premium", exclusive: true, personalize: true }),

    daily: { base: "assets/daily", days: days }
  };
})();
