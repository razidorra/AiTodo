import { createClerk } from "./clerk-client.js";
import { getLoginUrl, getTodoAppUrl } from "./redirects.js";

const statusBox = queryElement<HTMLElement>("#clerk-status");
const signUpBox = queryElement<HTMLElement>("#sign-up");

function queryElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element ${selector} wurde nicht gefunden.`);
  }

  return element;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Registrierung konnte nicht geladen werden.";
}

function showStatus(message: string, variant = "alert"): void {
  statusBox.className = `alert ${variant}`;
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
}

async function initRegister(): Promise<void> {
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

initRegister().catch((error: unknown) => {
  showStatus(getErrorMessage(error), "alert-error");
});
