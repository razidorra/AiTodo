import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getTodoAppUrl } from "./redirects.js";

const statusBox = document.querySelector("#clerk-status");
const signUpBox = document.querySelector("#sign-up");

function showStatus(message, variant = "alert") {
  statusBox.className = `alert ${variant}`;
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
}

async function initRegister() {
  const clerk = await createClerk();

  if (clerk.isSignedIn) {
    window.location.assign(getTodoAppUrl());
    return;
  }

  const loginUrl = getLoginUrl();
  statusBox.classList.add("hidden");
  clerk.mountSignUp(signUpBox, {
    forceRedirectUrl: loginUrl,
    fallbackRedirectUrl: loginUrl,
  });
}

initRegister().catch((error) => {
  showStatus(error.message, "alert-error");
});
