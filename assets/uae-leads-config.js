/* Public settings only. Set apiUrl after deploying lead-tracker-service.
   Never add a service account, Slack token, sync secret, or password here. */
window.UAELeadsConfig = Object.freeze({
  apiUrl: '',
  // Set the NEW dedicated Firebase project PUBLIC web-app config here
  // before setting apiUrl. Authentication and backend must use that project.
  firebase: null
});
