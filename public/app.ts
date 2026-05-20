import { type JsonRequestOptions, requestJson } from "./api-client.js";
import { createClerk } from "./clerk-client.js";

type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
};

type Collaborator = {
  id?: string;
  username: string;
  email?: string;
};

type TodoFilter = "all" | "open" | "done";
type TodoUpdate = Partial<Pick<Todo, "completed" | "description" | "title">>;

const todoForm = queryElement<HTMLFormElement>("#todo-form");
const titleInput = queryElement<HTMLInputElement>("#title-input");
const descriptionInput = queryElement<HTMLTextAreaElement>("#description-input");
const formMessage = queryElement<HTMLElement>("#form-message");
const todoList = queryElement<HTMLElement>("#todo-list");
const emptyState = queryElement<HTMLElement>("#empty-state");
const guestUsernameForm = queryElement<HTMLFormElement>("#guest-username-form");
const guestUsernameInput = queryElement<HTMLInputElement>("#guest-username-input");
const workspaceOwnerLabel = queryElement<HTMLElement>("#workspace-owner-label");
const openCount = queryElement<HTMLElement>("#open-count");
const doneCount = queryElement<HTMLElement>("#done-count");
const teamCount = queryElement<HTMLElement>("#team-count");
const filterButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
const collaboratorForm = queryElement<HTMLFormElement>("#collaborator-form");
const collaboratorUsernameInput = queryElement<HTMLInputElement>("#collaborator-username-input");
const collaboratorEmailInput = queryElement<HTMLInputElement>("#collaborator-email-input");
const collaboratorMessage = queryElement<HTMLElement>("#collaborator-message");
const collaboratorList = queryElement<HTMLElement>("#collaborator-list");
const collaboratorTotal = queryElement<HTMLElement>("#collaborator-total");
const collaboratorEmptyState = queryElement<HTMLElement>("#collaborator-empty-state");
const collaboratorLockedMessage = queryElement<HTMLElement>("#collaborator-locked-message");
const collaboratorSubmitButton = queryElement<HTMLButtonElement>('#collaborator-form button[type="submit"]');
const todoSubmitButton = queryElement<HTMLButtonElement>('#todo-form button[type="submit"]');
const headerTodoButton = queryElement<HTMLButtonElement>('[form="todo-form"]');

let todos: Todo[] = [];
let collaborators: Collaborator[] = [];
let activeFilter: TodoFilter = "all";
let canManageCollaborators = false;
let ownerEmail = "";
let todoOwner = "";

function queryElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Element ${selector} wurde nicht gefunden.`);
  }

  return element;
}

function isTodoFilter(value: string | undefined): value is TodoFilter {
  return value === "all" || value === "open" || value === "done";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.";
}

function normalizeGuestUsername(value: string): string {
  return value.trim().replace(/\s+/g, "-").toLowerCase();
}

function createGuestOwner(username: string): string {
  return `guest:${normalizeGuestUsername(username)}`;
}

function createUserOwner(email: string): string {
  return `user:${email.trim().toLowerCase()}`;
}

function getTodoRequestOptions(options: JsonRequestOptions = {}): JsonRequestOptions {
  return {
    ...options,
    headers: {
      "X-Todo-Owner": todoOwner,
      ...options.headers,
    },
  };
}

function getInitials(value: string): string {
  return value.slice(0, 2).toUpperCase();
}

function visibleTodos(): Todo[] {
  if (activeFilter === "open") {
    return todos.filter((todo) => !todo.completed);
  }

  if (activeFilter === "done") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function renderCounts(): void {
  openCount.textContent = String(todos.filter((todo) => !todo.completed).length);
  doneCount.textContent = String(todos.filter((todo) => todo.completed).length);
  teamCount.textContent = String(collaborators.length);
}

function renderFilters(): void {
  filterButtons.forEach((button) => {
    button.classList.toggle("btn-active", button.dataset.filter === activeFilter);
  });
}

function setCollaboratorAccess(canManage: boolean): void {
  canManageCollaborators = canManage;
  collaboratorUsernameInput.disabled = !canManage;
  collaboratorEmailInput.disabled = !canManage;
  collaboratorSubmitButton.disabled = !canManage;
  collaboratorLockedMessage.classList.toggle("hidden", canManage);
}

function setTodoAccess(hasOwner: boolean, label = ""): void {
  titleInput.disabled = !hasOwner;
  descriptionInput.disabled = !hasOwner;
  todoSubmitButton.disabled = !hasOwner;
  headerTodoButton.disabled = !hasOwner;
  workspaceOwnerLabel.textContent = label;
  workspaceOwnerLabel.classList.toggle("hidden", !label);
}

function showGuestWorkspace(username: string): void {
  guestUsernameInput.value = username;
  guestUsernameForm.classList.remove("hidden");
  setTodoAccess(true, `Gast: @${username}`);
}

function showSignedInWorkspace(email: string): void {
  guestUsernameForm.classList.add("hidden");
  setTodoAccess(true, `Angemeldet: ${email}`);
}

function showLockedGuestWorkspace(): void {
  todos = [];
  guestUsernameForm.classList.remove("hidden");
  setTodoAccess(false, "");
  formMessage.textContent = "Gib einen Gast-Username ein oder logge dich ein.";
  renderTodos();
}

function createTodoElement(todo: Todo): HTMLElement {
  const item = document.createElement("article");
  item.className = "rounded-lg bg-base-100 p-4 shadow transition hover:shadow-md sm:p-5";

  const header = document.createElement("div");
  header.className = "flex flex-wrap items-start gap-3";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.className = "checkbox checkbox-primary mt-1 shrink-0";
  checkbox.setAttribute("aria-label", "Aufgabe als erledigt markieren");
  checkbox.addEventListener("change", () => updateTodo(todo.id, { completed: checkbox.checked }));

  const text = document.createElement("div");
  text.className = "min-w-0 flex-1";

  const title = document.createElement("h3");
  title.className = `break-words text-base font-semibold ${todo.completed ? "line-through opacity-60" : ""}`;
  title.textContent = todo.title;

  const description = document.createElement("p");
  description.className = "mt-1 break-words text-sm text-base-content/70";
  description.textContent = todo.description || "Keine Beschreibung";

  const actions = document.createElement("button");
  actions.type = "button";
  actions.className = "btn btn-ghost btn-sm w-full basis-full text-error sm:w-auto sm:basis-auto";
  actions.textContent = "Löschen";
  actions.addEventListener("click", () => deleteTodo(todo.id));

  text.append(title, description);
  header.append(checkbox, text, actions);
  item.append(header);

  return item;
}

function createCollaboratorElement(collaborator: Collaborator): HTMLElement {
  const item = document.createElement("article");
  item.className = "flex items-center gap-3 rounded-lg border border-base-300 p-3";

  const avatar = document.createElement("div");
  avatar.className = "avatar placeholder";
  avatar.innerHTML = `<div class="w-10 rounded-full bg-primary text-primary-content"><span>${getInitials(
    collaborator.username,
  )}</span></div>`;

  const content = document.createElement("div");
  content.className = "min-w-0 flex-1";

  const username = document.createElement("p");
  username.className = "truncate font-semibold";
  username.textContent = `@${collaborator.username}`;

  const details = document.createElement("p");
  details.className = "truncate text-xs text-base-content/60";
  details.textContent = "Workspace member";

  content.append(username, details);
  item.append(avatar, content);

  return item;
}

function renderCollaborators(): void {
  collaboratorList.replaceChildren(...collaborators.map(createCollaboratorElement));
  collaboratorEmptyState.classList.toggle("hidden", collaborators.length > 0);
  collaboratorTotal.textContent = String(collaborators.length);
  renderCounts();
}

function renderTodos(): void {
  const currentTodos = visibleTodos();
  todoList.replaceChildren(...currentTodos.map(createTodoElement));
  emptyState.classList.toggle("hidden", currentTodos.length > 0);
  renderCounts();
  renderFilters();
}

async function loadTodos(): Promise<void> {
  formMessage.textContent = "";
  if (!todoOwner) {
    todos = [];
    renderTodos();
    return;
  }

  todos = await requestJson<Todo[]>("/api/todos", getTodoRequestOptions());
  renderTodos();
}

async function loadCollaborators(): Promise<void> {
  collaboratorMessage.textContent = "";
  if (!ownerEmail) {
    collaborators = [];
    renderCollaborators();
    renderTodos();
    return;
  }

  collaborators = await requestJson<Collaborator[]>("/api/collaborators", {
    headers: {
      "X-Owner-Email": ownerEmail,
    },
  });
  renderCollaborators();
  renderTodos();
}

async function createTodo(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  formMessage.textContent = "";

  try {
    const createdTodo = await requestJson<Todo>("/api/todos", {
      ...getTodoRequestOptions({
        method: "POST",
        body: JSON.stringify({
          title: titleInput.value,
          description: descriptionInput.value,
        }),
      }),
    });

    todos = [...todos, createdTodo];
    todoForm.reset();
    titleInput.focus();
    renderTodos();
  } catch (error: unknown) {
    formMessage.textContent = getErrorMessage(error);
  }
}

async function addCollaborator(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  collaboratorMessage.textContent = "";
  collaboratorMessage.className = "min-h-5 text-sm";

  if (!canManageCollaborators) {
    collaboratorMessage.textContent = "Bitte logge dich ein, um Personen hinzuzufügen.";
    collaboratorMessage.classList.add("text-error");
    return;
  }

  try {
    const collaborator = await requestJson<Collaborator>("/api/collaborators", {
      method: "POST",
      headers: {
        "X-Owner-Email": ownerEmail,
      },
      body: JSON.stringify({
        email: collaboratorEmailInput.value,
        username: collaboratorUsernameInput.value,
      }),
    });

    collaborators = [...collaborators, collaborator];
    collaboratorForm.reset();
    collaboratorEmailInput.focus();
    collaboratorMessage.textContent = "Person wurde hinzugefügt.";
    collaboratorMessage.classList.add("text-success");
    renderCollaborators();
    renderTodos();
  } catch (error: unknown) {
    collaboratorMessage.textContent = getErrorMessage(error);
    collaboratorMessage.classList.add("text-error");
  }
}

async function loadWorkspace(): Promise<void> {
  try {
    const clerk = await createClerk();
    ownerEmail = clerk.user?.primaryEmailAddress?.emailAddress || "";
    todoOwner = clerk.isSignedIn && ownerEmail ? createUserOwner(ownerEmail) : "";
    setCollaboratorAccess(Boolean(clerk.isSignedIn && ownerEmail));

    if (todoOwner) {
      showSignedInWorkspace(ownerEmail);
      await Promise.all([loadTodos(), loadCollaborators()]);
      return;
    }
  } catch {
    ownerEmail = "";
    todoOwner = "";
  }

  ownerEmail = "";
  setCollaboratorAccess(false);
  collaborators = [];
  renderCollaborators();

  const guestUsername = localStorage.getItem("todoflowGuestUsername") || "";

  if (!guestUsername) {
    showLockedGuestWorkspace();
    return;
  }

  todoOwner = createGuestOwner(guestUsername);
  showGuestWorkspace(guestUsername);
  await loadTodos();
}

async function saveGuestUsername(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const username = normalizeGuestUsername(guestUsernameInput.value);

  if (!username) {
    formMessage.textContent = "Bitte gib einen Gast-Username ein.";
    guestUsernameInput.focus();
    return;
  }

  localStorage.setItem("todoflowGuestUsername", username);
  ownerEmail = "";
  todoOwner = createGuestOwner(username);
  setCollaboratorAccess(false);
  collaborators = [];
  renderCollaborators();
  showGuestWorkspace(username);
  await loadTodos();
}

async function updateTodo(id: string, updates: TodoUpdate): Promise<void> {
  const updatedTodo = await requestJson<Todo>(
    `/api/todos/${id}`,
    getTodoRequestOptions({
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  );

  todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
  renderTodos();
}

async function deleteTodo(id: string): Promise<void> {
  await requestJson<null>(
    `/api/todos/${id}`,
    getTodoRequestOptions({
      method: "DELETE",
    }),
  );

  todos = todos.filter((todo) => todo.id !== id);
  renderTodos();
}

todoForm.addEventListener("submit", createTodo);
collaboratorForm.addEventListener("submit", addCollaborator);
guestUsernameForm.addEventListener("submit", saveGuestUsername);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isTodoFilter(button.dataset.filter)) {
      activeFilter = button.dataset.filter;
    }

    renderTodos();
  });
});

setCollaboratorAccess(false);
setTodoAccess(false);

loadWorkspace().catch((error: unknown) => {
  formMessage.textContent = getErrorMessage(error);
});
