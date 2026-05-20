import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getRegisterUrl, getTodoAppUrl } from "./redirects.js";

const authActions = queryElement<HTMLElement>("#auth-actions");
const userEmail = queryElement<HTMLElement>("#nav-user-email");
const logoutButton = queryElement<HTMLButtonElement>("#logout-button");
const registerLink = queryElement<HTMLAnchorElement>("[data-auth-register]");
const loginLink = queryElement<HTMLAnchorElement>("[data-auth-login]");

function queryElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element ${selector} wurde nicht gefunden.`);
  }

  return element;
}

function showLoggedOut(): void {
  authActions.classList.remove("hidden");
  userEmail.classList.add("hidden");
  logoutButton.classList.add("hidden");
}

function showLoggedIn(email?: string): void {
  authActions.classList.add("hidden");
  userEmail.textContent = email || "Angemeldet";
  userEmail.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
}

async function initAuthNav(): Promise<void> {
  const clerk = await createClerk();

  registerLink.href = getRegisterUrl();
  loginLink.href = getLoginUrl();

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
