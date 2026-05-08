# Agent Rules

Stand: 2026-05-07

## Projektziel

Baue und erweitere eine Todo-App als TypeScript-Backend mit Express und klarer feature-basierter Architektur. Neue Funktionen sollen in eigenen Feature-Ordnern entstehen und nicht quer im ganzen Projekt verteilt werden.

## Aktueller Stack

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

## Aktuelle Scripts

```txt
npm start           startet dist/index.js
npm run build       kompiliert TypeScript nach dist/
npm run dev         startet index.ts mit nodemon und ts-node
npm run lint        prüft den Code mit ESLint
npm test            startet Vitest einmalig
npm run test:watch  startet Vitest im Watch Mode
```

## Arbeitsregeln

1. Erst bestehende Struktur lesen, dann ändern.
2. Kleine, nachvollziehbare Schritte machen.
3. Keine unnötigen Refactorings.
4. Keine fremden Änderungen überschreiben.
5. TypeScript verwenden, keine neuen `.js` Dateien in `src/` oder `tests/`.
6. Jede neue Fachfunktion bekommt einen eigenen Ordner unter `src/features`.
7. Gemeinsam genutzter Code kommt nach `src/shared`.
8. Konfiguration kommt nach `src/config`.
9. Datenbankzugriff kommt nach `src/database` oder in das jeweilige Feature-Repository.
10. Nach Code-Änderungen `npm run build`, `npm run lint` und passende Tests ausführen.

## Installierte Skills

Die installierten Skills sind Projekt-Hilfen, aber die Regeln dieses Projekts haben Vorrang. Beispiele aus Skills werden auf TypeScript, `strict` Mode und die feature-basierte Struktur angepasst.

1. `express-rest-api`
   - Express-Code bleibt in der bestehenden Struktur.
   - Routes verbinden nur URL und Controller.
   - Controller bleiben dünn und senden das definierte Response-Format.
   - Validation läuft über Zod in `todo.validation.ts` oder entsprechenden Feature-Dateien.
   - Fehler laufen über `AppError`, `notFound` und `errorHandler`.

2. `mongoose-mongodb`
   - Verbindungscode bleibt in `src/database/mongoose.ts`.
   - Fachlicher Datenzugriff bleibt im jeweiligen Repository, zum Beispiel `todo.repository.ts`.
   - Mongoose Schemas/Models für ein Feature dürfen im Feature-Ordner liegen, zum Beispiel `todo.model.ts`.
   - Services und Controller greifen nicht direkt auf Mongoose Models zu.
   - Tests für Datenbanklogik sollen isoliert laufen, zum Beispiel mit `mongodb-memory-server`.

3. `test-driven-development`
   - Bei neuen Features, Bugfixes und Verhaltensänderungen zuerst einen passenden Test ergänzen.
   - Den Test einmal fehlschlagen lassen, dann minimalen Code implementieren.
   - Danach Build, Lint und passende Tests ausführen.
   - Für reine Dokumentations- oder Konfigurationsänderungen reicht eine kurze Plausibilitätsprüfung.

## Projektstruktur

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

## Architekturregeln

### Feature Ordner

Ein Feature enthält alles, was fachlich zusammengehört.

Beispiel:

```txt
src/features/todos/
  todo.routes.ts
  todo.controller.ts
  todo.service.ts
  todo.repository.ts
  todo.model.ts
  todo.schema.ts
  todo.validation.ts
src/features/types/
  auth.types.ts
  todo.types.ts
```

### Keine Business-Logik in Routes

Routes verbinden nur URL und Controller.

### Controller bleiben dünn

Controller kümmern sich um Request und Response. Fachliche Entscheidungen gehören in Services.

### Services enthalten Regeln

Services entscheiden, was fachlich erlaubt ist und wann fachliche Fehler geworfen werden.

### Repositories kapseln Datenzugriff

Controller und Services sollen nicht direkt wissen, ob Daten aus einem Array, einer JSON-Datei oder einer Datenbank kommen.

### Types liegen zentral unter Features

Feature-Typen kommen in `src/features/types`, zum Beispiel `src/features/types/todo.types.ts`.

### Shared Code sparsam verwenden

Nur Code in `src/shared` ablegen, wenn er wirklich von mehreren Features benutzt wird.

## TypeScript Regeln

1. `strict` TypeScript bleibt aktiviert.
2. Request Bodies werden als `unknown` behandelt und in Validation-Dateien geprüft.
3. Express Handler bekommen passende Typen aus `express`.
4. Feature-Typen werden aus `src/features/types` importiert.
5. Zod ist die Standardlösung für Request-Validation.
6. Kein `any`, außer es gibt einen sehr guten Grund.
7. Imports bleiben relativ und nah an der bestehenden Struktur.

## Namensregeln

1. Feature-Dateien verwenden den Feature-Namen als Prefix.
2. Dateinamen sind klein geschrieben.
3. Neue Backend-Dateien in `src/` verwenden `.ts`.
4. Tests verwenden `.test.ts`.
5. Beispiele:
   - `todo.routes.ts`
   - `todo.controller.ts`
   - `todo.service.ts`
   - `todo.repository.ts`
   - `todo.schema.ts`
   - `todo.validation.ts`
   - `src/features/types/todo.types.ts`

## API Regeln

1. API-Routen beginnen mit `/api`.
2. Responses sind JSON.
3. Erfolgreiche Responses mit Body verwenden `{ "data": ... }`.
4. `DELETE` kann `204 No Content` zurückgeben.
5. Fehler haben eine einheitliche Struktur.
6. Auth-Endpunkte liegen unter `/api/auth`.

Beispiel:

```json
{
  "error": {
    "message": "Todo not found",
    "status": 404
  }
}
```

## Aktueller Todo Feature Stand

Implementiert:

1. `GET /api/todos`
2. `GET /api/todos/:id`
3. `POST /api/todos`
4. `PATCH /api/todos/:id`
5. `DELETE /api/todos/:id`
6. Mongoose Datenhaltung mit In-Memory-Fallback für Tests ohne DB-Verbindung
7. Zod Validation für `title`, `description` und `completed`
8. CORS Middleware
9. `.env` Loading über `dotenv`
10. MongoDB-Verbindung über Mongoose beim Serverstart
11. Helmet Security Middleware
12. API-Tests mit Vitest und Supertest
13. Auth Register und Login mit JWT

## Entwicklungsplan

Nächste sinnvolle Schritte:

1. Protected Todo-Routen mit JWT Middleware ergänzen.
2. Repository-Tests mit echter Testdatenbank ergänzen.
3. Formatting ergänzen.
4. Environment-Konfiguration bei Bedarf stärker validieren.

## Definition of Done

Eine Aufgabe ist fertig, wenn:

1. Der Code zur feature-basierten Struktur passt.
2. Der Code TypeScript ist und `npm run build` besteht.
3. `npm run lint` besteht.
4. Passende Tests laufen.
5. Fehlerfälle bedacht wurden.
6. Neue Logik an der richtigen Stelle liegt.
7. `spec.md` aktualisiert wurde, wenn sich Verhalten, API, Struktur oder Scripts ändern.
