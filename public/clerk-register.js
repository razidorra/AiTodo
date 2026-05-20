import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getTodoAppUrl } from "./redirects.js";
const statusBox = queryElement("#clerk-status");
const signUpBox = queryElement("#sign-up");
function queryElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element ${selector} wurde nicht gefunden.`);
    }
    return element;
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : "Registrierung konnte nicht geladen werden.";
}
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
    showStatus(getErrorMessage(error), "alert-error");
});
