import { createClerk } from "./clerk-client.js";
import { getTodoAppUrl } from "./redirects.js";

const statusBox = queryElement<HTMLElement>("#clerk-status");
const signInBox = queryElement<HTMLElement>("#sign-in");

function queryElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element ${selector} wurde nicht gefunden.`);
  }

  return element;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Login konnte nicht geladen werden.";
}

function showStatus(message: string, variant = "alert"): void {
  statusBox.className = `alert ${variant}`;
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
}

async function initLogin(): Promise<void> {
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

initLogin().catch((error: unknown) => {
  showStatus(getErrorMessage(error), "alert-error");
});
