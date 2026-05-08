# Todo App Specification

Stand: 2026-05-07

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
src/
  app.ts
  config/
    setting.ts
  database/
    mongoose.ts
  features/
    types/
      auth.types.ts
      todo.types.ts
    auth/
      auth.controller.ts
      auth.model.ts
      auth.repository.ts
      auth.routes.ts
      auth.schema.ts
      auth.service.ts
      auth.validation.ts
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
  todo-api.test.ts
  todo-service.test.ts
  todo-validation.test.ts
  test-utils.ts
spec.md
Agent.md
tsconfig.json
package.json
eslint.config.mjs
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

## API

```txt
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/todos
GET    /api/todos/:id
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

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

## Verantwortlichkeiten

### `src/app.ts`

Erstellt die Express-App, registriert Middleware, Healthcheck, Feature-Routes und Error Handling.

### `index.ts`

Verbindet MongoDB über `connectDatabase`, startet den HTTP-Server und schließt die Datenbankverbindung beim Shutdown.

### `src/config/setting.ts`

Lädt `.env` über `dotenv` und kapselt Environment-Werte wie `PORT`, `NODE_ENV`, `MONGODB_URI` und `JWT_SECRET`.

### `src/database/mongoose.ts`

Stellt `connectDatabase` und `disconnectDatabase` für die MongoDB-Anbindung bereit.

### `todo.routes.ts`

Definiert URLs und HTTP-Methoden. Routes rufen Controller auf.

### `auth.routes.ts`

Definiert Register- und Login-Routen unter `/api/auth`.

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

## Tests

Aktuelle Tests liegen in:

```txt
tests/todo-api.test.ts
tests/todo-service.test.ts
tests/todo-validation.test.ts
tests/auth-api.test.ts
tests/auth-service.test.ts
tests/auth-validation.test.ts
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

## Nächster Umsetzungsplan

1. Tests erweitern
   - Repository-Verhalten mit MongoDB-Testdatenbank prüfen
   - Weitere Fehlerfälle prüfen

2. Developer Experience verbessern
   - Formatter ergänzen

## Akzeptanzkriterien

Das aktuelle MVP gilt als fertig, wenn:

1. `npm run build` erfolgreich läuft.
2. `npm run lint` erfolgreich läuft.
3. `npm test` erfolgreich läuft.
4. Alle Todo CRUD-Endpunkte funktionieren.
5. Ungültige Eingaben sinnvolle Fehlermeldungen geben.
6. Business-Logik nicht direkt in Routes steht.
7. Neue fachliche Features unter `src/features` entstehen.
