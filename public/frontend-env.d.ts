declare module "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.mjs" {
  export class Clerk {
    constructor(publishableKey: string);

    isSignedIn: boolean;
    user?: {
      primaryEmailAddress?: {
        emailAddress?: string;
      };
    };

    load(options?: { ui?: { ClerkUI?: unknown } }): Promise<void>;
    mountSignIn(element: Element, options?: Record<string, string>): void;
    mountSignUp(element: Element, options?: Record<string, string>): void;
    signOut(options?: { redirectUrl?: string }): Promise<void>;
  }
}

interface Window {
  __internal_ClerkUICtor?: unknown;
}
