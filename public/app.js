import { requestJson } from "./api-client.js";
import { createClerk } from "./clerk-client.js";

const todoForm = document.querySelector("#todo-form");
const titleInput = document.querySelector("#title-input");
const descriptionInput = document.querySelector("#description-input");
const formMessage = document.querySelector("#form-message");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const guestUsernameForm = document.querySelector("#guest-username-form");
const guestUsernameInput = document.querySelector("#guest-username-input");
const workspaceOwnerLabel = document.querySelector("#workspace-owner-label");
const openCount = document.querySelector("#open-count");
const doneCount = document.querySelector("#done-count");
const teamCount = document.querySelector("#team-count");
const filterButtons = document.querySelectorAll("[data-filter]");
const collaboratorForm = document.querySelector("#collaborator-form");
const collaboratorUsernameInput = document.querySelector("#collaborator-username-input");
const collaboratorEmailInput = document.querySelector("#collaborator-email-input");
const collaboratorMessage = document.querySelector("#collaborator-message");
const collaboratorList = document.querySelector("#collaborator-list");
const collaboratorTotal = document.querySelector("#collaborator-total");
const collaboratorEmptyState = document.querySelector("#collaborator-empty-state");
const collaboratorLockedMessage = document.querySelector("#collaborator-locked-message");

let todos = [];
let collaborators = [];
let activeFilter = "all";
let canManageCollaborators = false;
let ownerEmail = "";
let todoOwner = "";

function normalizeGuestUsername(value) {
  return value.trim().replace(/\s+/g, "-").toLowerCase();
}

function createGuestOwner(username) {
  return `guest:${normalizeGuestUsername(username)}`;
}

function createUserOwner(email) {
  return `user:${email.trim().toLowerCase()}`;
}

function getTodoRequestOptions(options = {}) {
  return {
    ...options,
    headers: {
      "X-Todo-Owner": todoOwner,
      ...options.headers,
    },
  };
}

function getInitials(value) {
  return value.slice(0, 2).toUpperCase();
}

function visibleTodos() {
  if (activeFilter === "open") {
    return todos.filter((todo) => !todo.completed);
  }

  if (activeFilter === "done") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function renderCounts() {
  openCount.textContent = String(todos.filter((todo) => !todo.completed).length);
  doneCount.textContent = String(todos.filter((todo) => todo.completed).length);
  teamCount.textContent = String(collaborators.length);
}

function renderFilters() {
  filterButtons.forEach((button) => {
    button.classList.toggle("btn-active", button.dataset.filter === activeFilter);
  });
}

function setCollaboratorAccess(canManage) {
  canManageCollaborators = canManage;
  collaboratorUsernameInput.disabled = !canManage;
  collaboratorEmailInput.disabled = !canManage;
  collaboratorForm.querySelector("button").disabled = !canManage;
  collaboratorLockedMessage.classList.toggle("hidden", canManage);
}

function setTodoAccess(hasOwner, label = "") {
  titleInput.disabled = !hasOwner;
  descriptionInput.disabled = !hasOwner;
  todoForm.querySelector("button").disabled = !hasOwner;
  document.querySelector('[form="todo-form"]').disabled = !hasOwner;
  workspaceOwnerLabel.textContent = label;
  workspaceOwnerLabel.classList.toggle("hidden", !label);
}

function showGuestWorkspace(username) {
  guestUsernameInput.value = username;
  guestUsernameForm.classList.remove("hidden");
  setTodoAccess(true, `Gast: @${username}`);
}

function showSignedInWorkspace(email) {
  guestUsernameForm.classList.add("hidden");
  setTodoAccess(true, `Angemeldet: ${email}`);
}

function showLockedGuestWorkspace() {
  todos = [];
  guestUsernameForm.classList.remove("hidden");
  setTodoAccess(false, "");
  formMessage.textContent = "Gib einen Gast-Username ein oder logge dich ein.";
  renderTodos();
}

function createTodoElement(todo) {
  const item = document.createElement("article");
  item.className = "rounded-lg bg-base-100 p-5 shadow transition hover:shadow-md";

  const header = document.createElement("div");
  header.className = "flex items-start gap-3";

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
  actions.className = "btn btn-ghost btn-sm text-error";
  actions.textContent = "Löschen";
  actions.addEventListener("click", () => deleteTodo(todo.id));

  text.append(title, description);
  header.append(checkbox, text, actions);
  item.append(header);

  return item;
}

function createCollaboratorElement(collaborator) {
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

function renderCollaborators() {
  collaboratorList.replaceChildren(...collaborators.map(createCollaboratorElement));
  collaboratorEmptyState.classList.toggle("hidden", collaborators.length > 0);
  collaboratorTotal.textContent = String(collaborators.length);
  renderCounts();
}

function renderTodos() {
  const currentTodos = visibleTodos();
  todoList.replaceChildren(...currentTodos.map(createTodoElement));
  emptyState.classList.toggle("hidden", currentTodos.length > 0);
  renderCounts();
  renderFilters();
}

async function loadTodos() {
  formMessage.textContent = "";
  if (!todoOwner) {
    todos = [];
    renderTodos();
    return;
  }

  todos = await requestJson("/api/todos", getTodoRequestOptions());
  renderTodos();
}

async function loadCollaborators() {
  collaboratorMessage.textContent = "";
  if (!ownerEmail) {
    collaborators = [];
    renderCollaborators();
    renderTodos();
    return;
  }

  collaborators = await requestJson("/api/collaborators", {
    headers: {
      "X-Owner-Email": ownerEmail,
    },
  });
  renderCollaborators();
  renderTodos();
}

async function createTodo(event) {
  event.preventDefault();
  formMessage.textContent = "";

  try {
    const createdTodo = await requestJson("/api/todos", {
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
  } catch (error) {
    formMessage.textContent = error.message;
  }
}

async function addCollaborator(event) {
  event.preventDefault();
  collaboratorMessage.textContent = "";
  collaboratorMessage.className = "min-h-5 text-sm";

  if (!canManageCollaborators) {
    collaboratorMessage.textContent = "Bitte logge dich ein, um Personen hinzuzufügen.";
    collaboratorMessage.classList.add("text-error");
    return;
  }

  try {
    const collaborator = await requestJson("/api/collaborators", {
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
  } catch (error) {
    collaboratorMessage.textContent = error.message;
    collaboratorMessage.classList.add("text-error");
  }
}

async function loadWorkspace() {
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

async function saveGuestUsername(event) {
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

async function updateTodo(id, updates) {
  const updatedTodo = await requestJson(
    `/api/todos/${id}`,
    getTodoRequestOptions({
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  );

  todos = todos.map((todo) => (todo.id === id ? updatedTodo : todo));
  renderTodos();
}

async function deleteTodo(id) {
  await requestJson(
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
    activeFilter = button.dataset.filter;
    renderTodos();
  });
});

setCollaboratorAccess(false);
setTodoAccess(false);

loadWorkspace().catch((error) => {
  formMessage.textContent = error.message;
});
