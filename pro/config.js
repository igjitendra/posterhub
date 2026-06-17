/* PosterHub Pro — site config
 * ⚠️ इस एक file में ही सब सेटिंग हैं।
 */
window.CONFIG = {
  // ✅ आपका Google Apps Script Web App URL (जुड़ गया)
  API_URL: "https://script.google.com/macros/s/AKfycbxMlRdolmRT-2IozhM4itnuYzynjAm-gQEan-0s8S4EBQ7mEE9NmVN4v5tVVibN51YA/exec",

  BRAND: "PosterHub Pro",
  // अपना domain यहाँ डालें (share links के लिए), जैसे "https://pro.yoursite.com/"
  SITE_URL: "",

  // आपकी UPI डिटेल्स
  UPI_ID: "6387617678-2@okbizaxis",
  PAYEE_NAME: "PosterHub",

  // download poster ke upar wala watermark text
  WATERMARK: "PosterHab.vercel.app",

  PLANS: {
    plus:    { id: "plus",    name: "Poster Plus",  price: 30, rank: 1 },
    advance: { id: "advance", name: "Advance Plus", price: 49, rank: 2 }
  }
};
