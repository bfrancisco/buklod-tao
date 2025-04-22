import { setCollection, getCollection } from "./js/firestore_UNIV.js";

export function setCurrentBranchCookie(name, value) {
  const DATE = new Date();
  DATE.setTime(DATE.getTime() + (DATE.getTime() * 24 * 60 * 60 * 1000));
  document.cookie = name + "=" + value, + ";path=current_branch/";
}

export function getCurrentBranchCookie() {
  let pattern = new RegExp("current_branch" + "=.[^;]*");
  var matched = document.cookie.match(pattern);
  if (matched) {
    var cookie = matched[0].split("=");
    return cookie[1];
  }
  return null;
}
