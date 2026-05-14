import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getRegisterUrl, getTodoAppUrl } from "./redirects.js";

const authActions = document.querySelector("#auth-actions");
const userEmail = document.querySelector("#nav-user-email");
const logoutButton = document.querySelector("#logout-button");

function showLoggedOut() {
  authActions.classList.remove("hidden");
  userEmail.classList.add("hidden");
  logoutButton.classList.add("hidden");
}

function showLoggedIn(email) {
  authActions.classList.add("hidden");
  userEmail.textContent = email || "Angemeldet";
  userEmail.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
}

async function initAuthNav() {
  const clerk = await createClerk();

  authActions.querySelector("[data-auth-register]").href = getRegisterUrl();
  authActions.querySelector("[data-auth-login]").href = getLoginUrl();

  if (!clerk.isSignedIn) {
    showLoggedOut();
    return;
  }

  showLoggedIn(clerk.user?.primaryEmailAddress?.emailAddress);

  logoutButton.addEventListener("click", async () => {
    await clerk.signOut({
      redirectUrl: getTodoAppUrl(),
    });
  });
}

initAuthNav().catch(() => {
  showLoggedOut();
});
