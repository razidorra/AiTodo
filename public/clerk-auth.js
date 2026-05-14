import { createClerk } from "./clerk-client.js";
import { getTodoAppUrl } from "./redirects.js";

const statusBox = document.querySelector("#clerk-status");
const signInBox = document.querySelector("#sign-in");

function showStatus(message, variant = "alert") {
  statusBox.className = `alert ${variant}`;
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
}

async function initLogin() {
  const clerk = await createClerk();
  const todoAppUrl = getTodoAppUrl();

  if (clerk.isSignedIn) {
    window.location.assign(todoAppUrl);
    return;
  }

  statusBox.classList.add("hidden");
  clerk.mountSignIn(signInBox, {
    forceRedirectUrl: todoAppUrl,
    fallbackRedirectUrl: todoAppUrl,
  });
}

initLogin().catch((error) => {
  showStatus(error.message, "alert-error");
});
