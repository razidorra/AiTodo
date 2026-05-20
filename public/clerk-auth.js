import { createClerk } from "./clerk-client.js";
import { getTodoAppUrl } from "./redirects.js";
const statusBox = queryElement("#clerk-status");
const signInBox = queryElement("#sign-in");
function queryElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Element ${selector} wurde nicht gefunden.`);
    }
    return element;
}
function getErrorMessage(error) {
    return error instanceof Error ? error.message : "Login konnte nicht geladen werden.";
}
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
    showStatus(getErrorMessage(error), "alert-error");
});
