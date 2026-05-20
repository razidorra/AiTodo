import { Clerk } from "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.mjs";
import { getClientConfig } from "./api-client.js";

let clerkUiLoadPromise: Promise<void> | undefined;

function getClerkDomain(publishableKey: string): string {
  return atob(publishableKey.split("_")[2]).slice(0, -1);
}

function loadClerkUi(publishableKey: string): Promise<void> {
  if (window.__internal_ClerkUICtor) {
    return Promise.resolve();
  }

  if (!clerkUiLoadPromise) {
    clerkUiLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://${getClerkDomain(publishableKey)}/npm/@clerk/ui@1/dist/ui.browser.js`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Clerk UI konnte nicht geladen werden."));
      document.head.appendChild(script);
    });
  }

  return clerkUiLoadPromise;
}

export async function createClerk(): Promise<Clerk> {
  const config = await getClientConfig();

  if (!config.clerkPublishableKey) {
    throw new Error("CLERK_PUBLISHABLE_KEY fehlt in deiner .env.");
  }

  await loadClerkUi(config.clerkPublishableKey);

  const clerk = new Clerk(config.clerkPublishableKey);
  await clerk.load({
    ui: { ClerkUI: window.__internal_ClerkUICtor },
  });

  return clerk;
}
