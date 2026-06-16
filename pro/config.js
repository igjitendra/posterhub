/* PosterHub Pro — site config
 * ⚠️ Apps Script deploy करने के बाद नीचे API_URL में Web App URL paste करें। */
window.CONFIG = {
  API_URL: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
  BRAND: "PosterHub Pro",
  SITE_URL: "",                 // hosting के बाद full URL डालें, जैसे https://pro.yoursite.com/
  UPI_ID: "6387617678-2@okbizaxis",
  PAYEE_NAME: "PosterHub",
  PLANS: {
    plus:    { id: "plus",    name: "Poster Plus",  price: 30, rank: 1 },
    advance: { id: "advance", name: "Advance Plus", price: 49, rank: 2 }
  }
};
