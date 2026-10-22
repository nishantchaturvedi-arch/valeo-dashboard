/* Public settings only. Set apiUrl after deploying lead-tracker-service.
   Never add a service account, Slack token, sync secret, or password here. */
window.UAELeadsConfig = Object.freeze({
  apiUrl: '',
  // Reuse the existing Firebase project for Authentication by default.
  // If a separate project is chosen, set its PUBLIC web-app config here.
  firebase: null
});
