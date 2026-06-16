/* PosterHub Pro — site config
 * ⚠️ इस एक file में ही सब सेटिंग हैं।
 */
window.CONFIG = {
  // ✅ आपका Google Apps Script Web App URL (जुड़ गया)
  API_URL: "https://script.google.com/macros/s/AKfycbyqu4AXY1Q_blxNbTqeIyRh0nUnXWvBN1zsn12bSLURIuIziyqcDmE2T6g89pwQk0LR/exec",

  BRAND: "PosterHub Pro",
  // अपना domain यहाँ डालें (share links के लिए), जैसे "https://pro.yoursite.com/"
  SITE_URL: "",

  // आपकी UPI डिटेल्स
  UPI_ID: "6387617678-2@okbizaxis",
  PAYEE_NAME: "PosterHub",

  PLANS: {
    plus:    { id: "plus",    name: "Poster Plus",  price: 30, rank: 1 },
    advance: { id: "advance", name: "Advance Plus", price: 49, rank: 2 }
  }
};
