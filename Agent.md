# Agent Rules

Stand: 2026-05-15

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
DaisyUI
Tailwind Browser CDN
ClerkJS
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
11. Secrets niemals in Frontend-Code oder Responses ausgeben.
12. `JWT_SECRET` bleibt Pflicht und bekommt keinen hardcodierten Fallback.
13. `CLERK_SECRET_KEY` gehört nicht in Browser-Code. Für Clerk-Frontend nur Publishable Keys verwenden.
14. Todo-Listen dürfen nicht global geteilt werden. Jeder Todo-Zugriff braucht einen Besitzer-Kontext.

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
  collaborator.types.ts
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

### Frontend

Das Frontend liegt unter `public/` und wird von Express statisch ausgeliefert.

1. HTML-Seiten verwenden DaisyUI/Tailwind-Klassen.
2. Browser-JavaScript verwendet ES-Module mit `import`.
3. Gemeinsame Browser-Helfer liegen in eigenen Modulen, zum Beispiel `api-client.js`.
4. Clerk-Seiten sind getrennt:
   - `/register` registriert neue Accounts.
   - `/login` meldet bestehende Accounts an.
5. Frontend ruft Backend-APIs über `/api/...` auf.
6. Keine Secrets in `public/` hardcoden.
7. Clerk-Redirects verwenden `forceRedirectUrl` und `fallbackRedirectUrl`.
8. ClerkJS v6 muss vor `clerk.load()` das Clerk UI Bundle laden und als `ui: { ClerkUI: window.__internal_ClerkUICtor }` übergeben, wenn gemountete Clerk-Komponenten genutzt werden.
9. Todo-Requests aus dem Frontend senden immer `X-Todo-Owner`.
10. Eingeloggte Todo-Listen verwenden `user:<email>`, Gastlisten verwenden `guest:<username>`.
11. Gäste dürfen per Gast-Username eigene Todo-Listen nutzen; der Username wird nur lokal im Browser gespeichert.
12. Responsive Layouts müssen auf kleinen Bildschirmen ohne horizontales Überlaufen funktionieren; Header-Aktionen, Formulare, Filter, Stats und dynamische Karten sollen umbrechen oder volle Breite nutzen.

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
7. Collaborator-Endpunkte liegen unter `/api/collaborators`.
8. Client-Config liegt unter `/api/client-config` und darf nur öffentliche Werte enthalten.
9. Todo-Endpunkte unter `/api/todos` benötigen `X-Todo-Owner`.
10. Ohne `X-Todo-Owner` antwortet die Todo-API mit `400 Todo owner is required`.
11. Repositories filtern Todo-Daten immer nach `ownerKey`.

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
6. Besitzer-getrennte Todo-Listen über `X-Todo-Owner`
7. Gastlisten über Gast-Username im Frontend
8. Mongoose Datenhaltung mit In-Memory-Fallback für Tests ohne DB-Verbindung
9. Zod Validation für `title`, `description` und `completed`
10. CORS Middleware
11. `.env` Loading über `dotenv`
12. MongoDB-Verbindung über Mongoose beim Serverstart
13. Helmet Security Middleware
14. API-Tests mit Vitest und Supertest
15. Auth Register und Login mit JWT
16. Responsive DaisyUI-Frontend unter `/` mit mobilen Header-Aktionen, Stats, Filtern, Formularen und Todo-Karten
17. Clerk Registrierung unter `/register`
18. Clerk Login unter `/login`
19. Client-Config unter `/api/client-config`
20. Collaborator Feature unter `/api/collaborators`
21. Collaborators können per E-Mail hinzugefügt werden
22. Collaborator-E-Mails sind eindeutig und werden normalisiert
23. Auth-Registrierung gibt bei doppelter E-Mail `409` zurück, auch bei MongoDB Duplicate-Key-Fehlern

## Aktueller Collaborator Feature Stand

Implementiert:

1. `GET /api/collaborators`
2. `POST /api/collaborators`
3. Zod Validation für E-Mail
4. E-Mail-Normalisierung auf Kleinschreibung
5. Einmaliges Hinzufügen pro E-Mail und Owner
6. Username wird beim Hinzufügen explizit eingegeben
7. Mongoose Datenhaltung mit In-Memory-Fallback
8. Anzeige im Frontend nur mit Username/Display-Name im Team-Bereich
9. Collaborators sind Workspace-Mitglieder und werden nicht automatisch auf jeder Aufgabe erwähnt
10. Gäste dürfen in der Oberfläche Todos nutzen, aber keine Personen hinzufügen
11. E-Mail-Adressen und interne IDs hinzugefügter Personen werden in der Oberfläche nicht angezeigt
12. Collaborators werden in der aktuellen API über `X-Owner-Email` pro eingeloggtem User gefiltert

## Auth und Clerk Regeln

1. Lokale Auth API unter `/api/auth` bleibt für Backend-Tests und JWT-Flow bestehen.
2. Clerk-Frontend nutzt nur den Publishable Key aus `/api/client-config`.
3. Registrierung und Login sind getrennte Seiten.
4. Nutzer registrieren sich zuerst über `/register`, danach ist `/login` für bestehende Accounts.
5. Gleiche E-Mail darf nur einmal registriert werden.
6. Todo-Daten sind über `X-Todo-Owner` nach eingeloggtem User oder Gast-Username getrennt.
7. `X-Todo-Owner` und `X-Owner-Email` sind aktuelle Client-Kontexte; echte Security braucht serverseitige Clerk Token-Verifizierung.

## Environment Regeln

1. `.env` wird geladen.
2. `public/.env` kann zusätzlich geladen werden, damit `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` lokal funktioniert.
3. `JWT_SECRET` ist Pflicht.
4. `CLERK_PUBLISHABLE_KEY` und `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` sind öffentliche Clerk-Keys.
5. `CLERK_SECRET_KEY` darf nicht an den Browser ausgegeben werden.
6. `public/.env` ist ignoriert und darf nicht committed werden.

## Entwicklungsplan

Nächste sinnvolle Schritte:

1. Protected Todo-Routen mit Clerk/JWT Middleware ergänzen.
2. Repository-Tests mit echter Testdatenbank ergänzen.
3. Formatting ergänzen.
4. Environment-Konfiguration bei Bedarf stärker validieren.
5. `X-Todo-Owner` und `X-Owner-Email` serverseitig aus verifizierten Clerk Tokens ableiten.
6. Collaborators echten Todo-Listen oder einzelnen Todos zuordnen.

## Definition of Done

Eine Aufgabe ist fertig, wenn:

1. Der Code zur feature-basierten Struktur passt.
2. Der Code TypeScript ist und `npm run build` besteht.
3. `npm run lint` besteht.
4. Passende Tests laufen.
5. Fehlerfälle bedacht wurden.
6. Neue Logik an der richtigen Stelle liegt.
7. `spec.md` aktualisiert wurde, wenn sich Verhalten, API, Struktur oder Scripts ändern.
