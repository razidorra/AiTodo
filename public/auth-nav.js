import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getRegisterUrl, getTodoAppUrl } from "./redirects.js";
const authActions = queryElement("#auth-actions");
const userEmail = queryElement("#nav-user-email");
const logoutButton = queryElement("#logout-button");
const registerLink = queryElement("[data-auth-register]");
const loginLink = queryElement("[data-auth-login]");
function queryElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element ${selector} wurde nicht gefunden.`);
    }
    return element;
}
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
