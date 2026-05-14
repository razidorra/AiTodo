# Todo App Specification

Stand: 2026-05-14

## Ziel

Diese Todo-App ist ein TypeScript-Backend mit Express und feature-basierter Struktur. Jede fachliche Funktion lebt in einem eigenen Feature-Ordner, damit Routes, Controller, Services, Repositories und Validation zusammenbleiben.

## Aktueller Projektstand

Bereits umgesetzt:

1. TypeScript-Projekt mit `tsconfig.json`
2. Express-App mit JSON Middleware
3. CORS Middleware aktiviert
4. `.env` wird über `dotenv` geladen
5. Serverstart über `index.ts`
6. Healthcheck unter `GET /api/health`
7. Todo CRUD API unter `/api/todos`
8. Auth API mit Register und Login unter `/api/auth`
9. JWT Token-Ausgabe für Auth-Responses
10. Passwort-Hashing mit `bcryptjs`
11. Mongoose Repository für Todos und Auth-Users mit In-Memory-Fallback für Tests ohne DB-Verbindung
12. Zod Validation für Todo- und Auth-Requests
13. MongoDB-Verbindung über Mongoose beim Serverstart
14. Zentrale 404- und Error-Middleware
15. API-Tests mit Vitest und Supertest
16. Build-Script mit TypeScript-Ausgabe nach `dist/`
17. ESLint Setup mit Flat Config
18. Projekt-Skills für Express REST API, Mongoose/MongoDB und TDD installiert
19. Statisches HTML-Frontend unter `/` mit DaisyUI und Todo-API-Anbindung
20. Clerk-Registrierungsseite unter `/register` und Login-Seite unter `/login` mit ClerkJS und öffentlicher Client-Config
21. Collaborator API unter `/api/collaborators` zum einmaligen Hinzufügen von Personen per E-Mail
22. Todo-Listen sind pro Besitzer getrennt: eingeloggte Nutzer verwenden `user:<email>`, Gäste verwenden `guest:<username>`
23. Frontend-Gäste können einen Gast-Username setzen und damit eine eigene Todo-Liste verwenden
24. ClerkJS lädt das separate Clerk UI Bundle, damit `mountSignIn` und `mountSignUp` funktionieren

Noch offen:

1. Weitere Repository-Tests mit echter Testdatenbank ergänzen
2. Optional: Formatting ergänzen

## Tech Stack

```txt
Node.js
TypeScript
Express
cors
dotenv
helmet
jsonwebtoken
bcryptjs
zod
mongoose
nodemon
ts-node
Vitest
Supertest
ESLint
DaisyUI
Tailwind Browser CDN
ClerkJS
Clerk UI Bundle
```

## Installierte Projekt-Skills

Die Skills liegen unter `.agents/skills` und werden über `skills-lock.json` festgehalten.

```txt
express-rest-api
mongoose-mongodb
test-driven-development
```

Die Skill-Inhalte werden projektbezogen angewendet:

1. Express-Beispiele werden auf TypeScript, `RequestHandler`, Zod und das bestehende `{ "data": ... }` / `{ "error": ... }` Response-Format angepasst.
2. Mongoose-Beispiele werden so umgesetzt, dass Datenzugriff in Repositories bleibt und die Verbindung über `src/database/mongoose.ts` läuft.
3. TDD gilt für neue Features, Bugfixes und Verhaltensänderungen. Reine Dokumentations- und Konfigurationsänderungen brauchen keine neuen Tests.

## Lokale Befehle

```txt
npm run dev
npm run build
npm start
npm run lint
npm test
npm run test:watch
```

### Scripts

```txt
npm run dev         startet index.ts mit nodemon und ts-node
npm run build       kompiliert TypeScript nach dist/
npm start           startet dist/index.js
npm run lint        prüft den Code mit ESLint
npm test            startet Vitest einmalig
npm run test:watch  startet Vitest im Watch Mode
```

Der lokale Server läuft standardmäßig auf:

```txt
http://localhost:3000
```

## Ordnerstruktur

```txt
.agents/
  skills/
skills-lock.json
index.ts
public/
  api-client.js
  app.js
  auth-nav.js
  clerk-auth.js
  clerk-client.js
  clerk-register.js
  index.html
  login/
    index.html
  login.html
  register/
    index.html
  register.html
  redirects.js
src/
  app.ts
  config/
    setting.ts
  database/
    mongoose.ts
  features/
    types/
      auth.types.ts
      collaborator.types.ts
      todo.types.ts
    auth/
      auth.controller.ts
      auth.model.ts
      auth.repository.ts
      auth.routes.ts
      auth.schema.ts
      auth.service.ts
      auth.validation.ts
    collaborators/
      collaborator.controller.ts
      collaborator.model.ts
      collaborator.repository.ts
      collaborator.routes.ts
      collaborator.schema.ts
      collaborator.service.ts
      collaborator.validation.ts
    todos/
      todo.controller.ts
      todo.model.ts
      todo.repository.ts
      todo.routes.ts
      todo.schema.ts
      todo.service.ts
      todo.validation.ts
  shared/
    errors/
      app-error.ts
    middleware/
      error-handler.ts
      not-found.ts
tests/
  auth-api.test.ts
  auth-service.test.ts
  auth-validation.test.ts
  collaborator-api.test.ts
  config-setting.test.ts
  setup-env.ts
  todo-api.test.ts
  todo-service.test.ts
  todo-validation.test.ts
  test-utils.ts
spec.md
Agent.md
tsconfig.json
package.json
eslint.config.mjs
vitest.config.ts
```

## Datenmodell

### Todo

```ts
type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Intern wird ein `ownerKey` gespeichert, aber nicht an das Frontend ausgegeben.

```ts
type TodoOwnerKey = `user:${string}` | `guest:${string}`;
```

### CreateTodoInput

```ts
type CreateTodoInput = {
  title: string;
  description: string;
};
```

### UpdateTodoInput

```ts
type UpdateTodoInput = Partial<
  Pick<Todo, "title" | "description" | "completed">
>;
```

### Collaborator

```ts
type Collaborator = {
  id: string;
  ownerEmail: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};
```

### CreateCollaboratorInput

```ts
type CreateCollaboratorInput = {
  email: string;
  username: string;
};
```

## API

```txt
GET    /api/health
GET    /
GET    /login
GET    /register
GET    /api/client-config
GET    /api/collaborators
POST   /api/collaborators
POST   /api/auth/register
POST   /api/auth/login
GET    /api/todos
GET    /api/todos/:id
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

### Todo Owner Header

Alle Todo-Endpunkte unter `/api/todos` benötigen den Header:

```txt
X-Todo-Owner: user:name@example.com
X-Todo-Owner: guest:username
```

Ohne diesen Header antwortet die API mit `400 Todo owner is required`.

Das Frontend setzt den Header automatisch:

1. Eingeloggt über Clerk: `user:<primaryEmailAddress>`
2. Nicht eingeloggt als Gast: `guest:<normalisierter-username>`

Gast-Usernamen werden im Browser in `localStorage` gespeichert. Nach Logout wird die eingeloggte Todo-Liste nicht mehr angezeigt; stattdessen wird die Gastliste des gespeicherten Gast-Usernames oder ein leeres Gast-Username-Formular angezeigt.

## Response Format

Erfolgreiche Responses mit Body verwenden:

```json
{
  "data": {}
}
```

Fehler verwenden:

```json
{
  "error": {
    "message": "Todo not found",
    "status": 404
  }
}
```

## Endpunkte

### GET /api/health

Response:

```json
{
  "status": "ok"
}
```

### GET /

Liefert das responsive DaisyUI-Frontend `public/index.html`.

### GET /register

Liefert die Clerk-Registrierungsseite. Die Registrierung läuft im Browser über ClerkJS. Eine E-Mail kann bei Clerk nur einmal registriert werden.

### GET /login

Liefert die Clerk-Login-Seite. Die Seite verweist auf `/register`, wenn noch kein Account besteht.

### GET /api/client-config

Response:

```json
{
  "data": {
    "clerkPublishableKey": "pk_test_..."
  }
}
```

Diese Route gibt keine Secrets wie `JWT_SECRET` oder `CLERK_SECRET_KEY` aus.

### POST /api/auth/register

Request:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "generated-id",
      "email": "user@example.com",
      "createdAt": "2026-05-07T00:00:00.000Z",
      "updatedAt": "2026-05-07T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### POST /api/auth/login

Request:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "generated-id",
      "email": "user@example.com",
      "createdAt": "2026-05-07T00:00:00.000Z",
      "updatedAt": "2026-05-07T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### GET /api/todos

Response:

```json
{
  "data": []
}
```

### POST /api/todos

Request:

```json
{
  "title": "Learn TypeScript",
  "description": "Build the todo API"
}
```

Response:

```json
{
  "data": {
    "id": "generated-uuid",
    "title": "Learn TypeScript",
    "description": "Build the todo API",
    "completed": false,
    "createdAt": "2026-05-07T00:00:00.000Z",
    "updatedAt": "2026-05-07T00:00:00.000Z"
  }
}
```

### PATCH /api/todos/:id

Request:

```json
{
  "title": "Updated title",
  "completed": true
}
```

Response:

```json
{
  "data": {
    "id": "generated-uuid",
    "title": "Updated title",
    "description": "",
    "completed": true,
    "createdAt": "2026-05-07T00:00:00.000Z",
    "updatedAt": "2026-05-07T00:05:00.000Z"
  }
}
```

### DELETE /api/todos/:id

Response:

```txt
204 No Content
```

### GET /api/collaborators

Response:

```json
{
  "data": [
    {
      "id": "generated-id",
      "email": "friend@example.com",
      "username": "friend",
      "createdAt": "2026-05-14T00:00:00.000Z",
      "updatedAt": "2026-05-14T00:00:00.000Z"
    }
  ]
}
```

### POST /api/collaborators

Request:

```json
{
  "email": "friend@example.com",
  "username": "Friend"
}
```

Response:

```json
{
  "data": {
    "id": "generated-id",
    "ownerEmail": "owner@example.com",
    "email": "friend@example.com",
    "username": "Friend",
    "createdAt": "2026-05-14T00:00:00.000Z",
    "updatedAt": "2026-05-14T00:00:00.000Z"
  }
}
```

Doppelte E-Mail-Adressen werden pro Owner mit `409` und `Collaborator email already added` abgelehnt. Die aktuelle API-Grenze verwendet `X-Owner-Email`, das vom Frontend aus dem Clerk-User gesetzt wird. Für echte Security muss als nächster Schritt ein Clerk Token serverseitig verifiziert werden.

## Verantwortlichkeiten

### `src/app.ts`

Erstellt die Express-App, registriert Middleware, statische Frontend-Auslieferung, Healthcheck, Client-Config, Feature-Routes und Error Handling.

### `index.ts`

Verbindet MongoDB über `connectDatabase`, startet den HTTP-Server und schließt die Datenbankverbindung beim Shutdown.

### `src/config/setting.ts`

Lädt `.env` und optional `public/.env` über `dotenv` und kapselt Environment-Werte wie `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `CLERK_PUBLISHABLE_KEY` und `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. `JWT_SECRET` ist Pflicht und hat keinen hardcodierten Fallback. Für die Clerk-Login-Seite wird nur der Publishable Key als öffentliche Client-Config bereitgestellt.

### `src/database/mongoose.ts`

Stellt `connectDatabase` und `disconnectDatabase` für die MongoDB-Anbindung bereit.

### `todo.routes.ts`

Definiert URLs und HTTP-Methoden. Routes rufen Controller auf.

### `auth.routes.ts`

Definiert Register- und Login-Routen unter `/api/auth`.

### `collaborator.routes.ts`

Definiert Listen- und Hinzufügen-Routen unter `/api/collaborators`.

### `todo.controller.ts`

Liest Request-Daten, ruft Services auf und sendet JSON Responses.

### `todo.service.ts`

Enthält Business-Logik und entscheidet, wann Fehler wie `Todo not found` geworfen werden.

### `todo.repository.ts`

Kapselt Datenzugriff. Bei aktiver MongoDB-Verbindung nutzt es Mongoose. Ohne aktive Verbindung nutzt es einen In-Memory-Fallback für lokale Tests.

### `todo.model.ts`

Definiert das Mongoose Model und die Umwandlung von MongoDB-Dokumenten in das API-Todo-Format.

### `todo.validation.ts`

Prüft und normalisiert Request-Daten mit Zod.

### `todo.schema.ts`

Definiert die Zod-Schemas für Create- und Update-Todo Requests.

### `src/features/types/todo.types.ts`

Definiert TypeScript-Typen für Todo-Daten und Input-Objekte.

### `src/features/types/auth.types.ts`

Definiert TypeScript-Typen für Auth-User, Public-User, Auth-Inputs und Auth-Responses.

### `src/features/types/collaborator.types.ts`

Definiert TypeScript-Typen für Personen, die per E-Mail zur Todo-Seite hinzugefügt wurden.

### `public/index.html`

Definiert das responsive DaisyUI-Frontend für TodoFlow mit Aufgaben, Team-Bereich, Statistiken und Navigation. Collaborators werden als Workspace-Mitglieder angezeigt, aber nicht automatisch auf einzelnen Aufgaben erwähnt. Gäste können Todos nutzen; Personen hinzufügen ist in der Oberfläche nur für eingeloggte Nutzer freigeschaltet. Die Oberfläche zeigt für hinzugefügte Personen keine E-Mail-Adressen oder internen IDs an.

### `public/app.js`

Steuert die Todo- und Collaborator-Oberfläche im Browser über die REST API.

### `public/api-client.js`

Kapselt Browser-Requests an die Backend-API und unterstützt lokale Live-Server-Entwicklung mit API-Fallback auf den Express-Port.

### `public/login.html` und `public/register.html`

Definieren getrennte Clerk-Seiten für Login und Registrierung.

### `public/clerk-auth.js` und `public/clerk-register.js`

Mounten ClerkJS Login bzw. Registrierung mit dem öffentlichen Publishable Key aus `/api/client-config`. Clerk-Redirects verwenden `forceRedirectUrl` und `fallbackRedirectUrl`, damit Login zur Todo-App und Registrierung zur Login-Seite führt.

### `public/redirects.js`

Erzeugt die passenden Redirect-Ziele für Express (`:3000`) und lokale Live-Server-Nutzung (`:5500`).

### `public/clerk-client.js`

Erstellt und lädt die ClerkJS-Instanz mit dem Publishable Key.

### `public/auth-nav.js`

Steuert die einfachen Header-Aktionen für Register, Login und Logout.

## Validierungsregeln

1. `title` ist beim Erstellen erforderlich.
2. `title` darf beim Bearbeiten nicht leer sein.
3. `description` muss ein String sein, wenn sie gesendet wird.
4. `completed` muss ein Boolean sein, wenn es gesendet wird.
5. PATCH Requests brauchen mindestens ein erlaubtes Feld.
6. Nicht erlaubte PATCH-Felder werden abgelehnt.
7. Auth-E-Mail muss gültig sein.
8. Register-Passwort braucht mindestens 6 Zeichen.
9. Login/Register normalisieren E-Mail-Adressen auf Kleinschreibung.
10. Auth-Registrierung akzeptiert dieselbe E-Mail nur einmal.
11. Collaborator-E-Mail muss gültig sein.
12. Collaborator-E-Mail wird normalisiert und darf nur einmal hinzugefügt werden.
13. Collaborator-Username ist beim Hinzufügen erforderlich.
14. `JWT_SECRET` ist Pflicht.

## Tests

Aktuelle Tests liegen in:

```txt
tests/todo-api.test.ts
tests/todo-service.test.ts
tests/todo-validation.test.ts
tests/auth-api.test.ts
tests/auth-service.test.ts
tests/auth-validation.test.ts
tests/collaborator-api.test.ts
tests/config-setting.test.ts
tests/setup-env.ts
tests/test-utils.ts
```

Getestet wird:

1. Todos erstellen und auflisten
2. Todo aktualisieren
3. Validierungsfehler
4. Todo löschen und danach 404 erhalten
5. Todo-Service-Logik
6. Todo-Validation-Logik
7. User registrieren
8. User einloggen
9. Auth-Validierungsfehler
10. Doppelte Registrierung und falsche Login-Daten
11. Frontend-Auslieferung für `/`, `/login` und `/register`
12. Client-Config ohne Secrets
13. Collaborators hinzufügen und auflisten
14. Doppelte Collaborator-E-Mails ablehnen
15. Pflichtkonfiguration für `JWT_SECRET`

## Nächster Umsetzungsplan

1. Tests erweitern
   - Repository-Verhalten mit MongoDB-Testdatenbank prüfen
   - Weitere Fehlerfälle prüfen

2. Developer Experience verbessern
   - Formatter ergänzen

3. Auth/Todo-Integration ausbauen
   - Todo-Routen mit Clerk/JWT schützen
   - `X-Todo-Owner` serverseitig aus verifizierten Clerk Tokens ableiten
   - Collaborators pro verifizierter Benutzer-/Todo-Liste isolieren

## Akzeptanzkriterien

Das aktuelle MVP gilt als fertig, wenn:

1. `npm run build` erfolgreich läuft.
2. `npm run lint` erfolgreich läuft.
3. `npm test` erfolgreich läuft.
4. Alle Todo CRUD-Endpunkte funktionieren.
5. Ungültige Eingaben sinnvolle Fehlermeldungen geben.
6. Business-Logik nicht direkt in Routes steht.
7. Neue fachliche Features unter `src/features` entstehen.
