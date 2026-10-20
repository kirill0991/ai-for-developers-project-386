# Исследование TypeSpec и генерации кода (issue #13)

Дата исследования: 20.10.2026.

Источники: официальная документация TypeSpec (https://typespec.io), репозиторий
microsoft/typespec, npm-страницы пакетов, документация orval и Fastify.

## TL;DR — рекомендуемый набор инструментов

| Задача | Инструмент | Зрелость | Вывод |
|--------|-----------|----------|-------|
| Контракт | TypeSpec (`@typespec/compiler`) | stable (1.17.0) | использовать |
| OpenAPI-спека | `@typespec/openapi3` | stable | использовать |
| Клиентский SDK (фронт) | `@typespec/http-client-js` | **preview** | рискованно; альтернатива — **orval** поверх OpenAPI |
| Серверные типы/валидация/маршруты | `@typespec/http-server-js` | **alpha** («highly experimental») | рискованно; альтернатива — `@typespec/json-schema` + Fastify |
| Единая команда | `tsp compile .` + orval | — | `npm run generate` |

Ключевой вывод: **TypeSpec + `@typespec/openapi3` — зрелая и стабильная связка**,
её стоит брать как источник истины. А вот **нативные генераторы клиента и сервера
(`http-client-js`, `http-server-js`) ещё незрелые** (preview/alpha) и для учебного
проекта надёжнее генерировать клиент и серверные артефакты из сгенерированного
OpenAPI-файла проверенными инструментами (orval, openapi-typescript, JSON Schema +
Fastify).

---

## 1. TypeSpec: минимальный контракт

TypeSpec — язык описания API от Microsoft (используется внутри Azure). Текущая
версия компилятора — **1.17.0** (октябрь 2026). Установка:

```
npm install -g @typespec/compiler
tsp init          # выбрать шаблон "Generic REST API"
tsp install       # поставить зависимости из package.json
tsp compile .     # скомпилировать
```

Проект TypeSpec состоит из `main.tsp` (контракт), `tspconfig.yaml` (конфиг
эмиттеров) и `package.json` (зависимости-эмиттеры). Сгенерированное по умолчанию
кладётся в `tsp-output/`.

### Базовый синтаксис

```tsp
import "@typespec/http";
using Http;

@service(#{ title: "Calendar" })
@server("https://example.com", "Single server endpoint")
namespace Calendar;

model Booking {
  id: string;
  @minLength(1) name: string;
  email: string;
  slot: string;   // "2026-03-28-09:00"
  createdAt: utcDateTime;
}
```

- `@service` — метаданные сервиса (title и т.п.), аналог `info` в OpenAPI.
- `@server` — URL сервера, аналог `servers` в OpenAPI.
- `namespace` — контейнер для моделей и операций; имя попадает в `operationId`.
- `model` — структура данных, аналог `schema` в OpenAPI.
- `@minLength(1)` и др. — валидационные аннотации, транслируются в JSON Schema
  (`minLength`, `minimum`, `maximum`).

### REST-эндпоинты (`op`, `@route`, HTTP-методы)

```tsp
@route("/bookings")
namespace Bookings {
  // Гость бронирует слот
  @post
  op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | {
    @statusCode statusCode: 409;   // слот уже занят
  };

  // Владелец смотрит брони
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body bookings: Booking[];
  };
}
```

- `@route("/bookings")` на namespace задаёт базовый путь; `@route` можно вешать и
  на отдельный `op`.
- `@get` / `@post` / `@put` / `@patch` / `@delete` задают HTTP-метод. Если метод не
  указан, эмиттер выводит его из имени операции.
- `@path` / `@query` / `@body` / `@header` помечают параметры операции.
- `@statusCode` + `@body` описывают ответ; оператор `|` задаёт несколько возможных
  ответов (например 201 и 409).

Полный пример для сценариев проекта — в разделе 6.

---

## 2. Генерация OpenAPI

Эмиттер **`@typespec/openapi3`** (stable). Установка и запуск:

```
npm install @typespec/openapi3
tsp compile . --emit=@typespec/openapi3
```

Либо через `tspconfig.yaml`:

```yaml
emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    emitter-output-dir: "{project-root}/tsp-output/@typespec/openapi3"
    file-type: yaml          # или json
```

Что выдаёт: файл `openapi.yaml` (или `.json`) с `paths`, `components/schemas`,
`servers`, `operationId` вида `Bookings_create`. Поддерживает OpenAPI **3.0 и 3.1**
(опция `openapi-versions`). `@server` превращается в `servers`, `@doc`/`@summary` —
в `description`/`summary`, модели — в `$ref`-схемы.

---

## 3. Клиентский SDK для фронтенда

### Вариант A: `@typespec/http-client-js` (нативный, preview)

```
npm install @typespec/http-client-js
tsp compile . --emit=@typespec/http-client-js
```

Генерирует идиоматичный JS/TS-клиент с типами, сериализацией запросов/ответов и
рантайм-зависимостью `@typespec/ts-http-runtime`. Опции: `emitter-output-dir`,
`package-name`. **Статус — preview**, API меняется между версиями. Для учебного
проекта с React это рабочий, но нестабильный путь.

### Вариант B: orval поверх OpenAPI (рекомендуется)

**orval** (https://orval.dev, v8) — зрелый генератор TypeScript-клиентов из
OpenAPI/Swagger. Генерирует типы, fetch/axios-функции и **готовые React Query
хуки** (`client: 'react-query'`), а также MSW-моки и Zod-схемы. Это самый
практичный вариант для React 19 + TS:

```
npm i -D orval
# orval.config.ts
import { defineConfig } from 'orval';
export default defineConfig({
  calendar: {
    input: './tsp-output/@typespec/openapi3/openapi.yaml',
    output: {
      target: './src/shared/api/generated.ts',
      client: 'react-query',
    },
  },
});
```

Запуск: `orval` (или `orval --config orval.config.ts`).

### Вариант C: openapi-typescript

`openapi-typescript` генерирует **только типы** (без функций/хуков) из OpenAPI.
Подходит, если хочется писать fetch-вызовы руками, но с полной типизацией.

**Вывод:** для React/TS надёжнее всего **orval** (зрелый, даёт хуки) поверх
сгенерированного `openapi.yaml`. Нативный `http-client-js` оставить как опцию на
будущее, когда выйдет из preview.

---

## 4. Серверные артефакты

### Вариант A: `@typespec/http-server-js` (нативный, alpha)

```
npm install @typespec/http-server-js
tsp compile . --emit=@typespec/http-server-js
```

Документация прямо помечает пакет: **«highly experimental and may be subject to
breaking changes and bugs»**. Генерирует:

- **Router** (`http/router.js`) — статический роутер `create<Service>Router(...)`,
  который можно повесить на Node.js `http.createServer()` или, при опции
  `express: true`, использовать как `router.expressMiddleware` в Express.
- **Service interfaces** — интерфейсы `Users<Context>` с методами-операциями,
  которые разработчик реализует вручную.
- **Models** — TypeScript-интерфейсы моделей.
- **Operation functions** — по функции на операцию: десериализация тела/query/
  headers, **валидация запроса**, вызов реализации, сериализация ответа.

То есть маршруты, типы и валидация генерируются, а бизнес-логика пишется вручную
в реализациях интерфейсов. Поддерживаются только **Node.js http и Express**.
Fastify/NestJS нативных эмиттеров нет (есть только ASP.Net — тоже alpha).

### Вариант B: `@typespec/json-schema` + Fastify (рекомендуется)

`@typespec/json-schema` (stable) генерирует JSON Schema из моделей TypeSpec:

```
npm install @typespec/json-schema
tsp compile . --emit=@typespec/json-schema
```

Fastify нативно валидирует запросы/ответы по JSON Schema (Ajv) и умеет выводить
типы из схем через type providers (`@fastify/type-provider-typebox`,
`@fastify/type-provider-json-schema-to-ts`). Схема из TypeSpec → валидация +
типизация маршрутов Fastify без ручного дублирования.

### Что реально доступно и зрело

| Генератор | Статус | Что даёт | Фреймворк |
|-----------|--------|----------|-----------|
| `@typespec/http-server-js` | alpha | роутер, интерфейсы, модели, валидация | Node http, Express |
| `@typespec/http-server-csharp` | alpha | серверный код | ASP.NET |
| `@typespec/json-schema` | stable | JSON Schema | любой (Fastify, Ajv) |
| `@typespec/openapi3` | stable | OpenAPI | любой (через openapi-генераторы) |

**Вывод:** зрелого «из коробки» серверного генератора под Fastify/NestJS нет.
Практичный путь — **`@typespec/json-schema` → Fastify** (валидация + типы), либо
`http-server-js` для Express, если готовы к alpha-статусу.

---

## 5. Единая команда генерации

Всё собирается в один `npm run generate`. Схема:

1. `tsp compile .` — из `main.tsp` генерирует OpenAPI (и, опционально, JSON Schema
   и/или нативные клиент/сервер) по `tspconfig.yaml`.
2. `orval` (или `openapi-typescript`) — из `openapi.yaml` генерирует клиентский SDK
   для фронтенда.

```jsonc
// package.json
{
  "scripts": {
    "generate": "tsp compile . && orval"
  }
}
```

### Куда класть сгенерированное и как исключить из линта/ревью

- **TypeSpec-выход** (`tsp-output/`) — целиком генерируемый, добавить в
  `.gitignore` (сейчас в `.gitignore` только `node_modules`, `dist`,
  `*.tsbuildinfo`).
- **Клиентский SDK** — в `src/shared/api/generated.ts` (или `src/generated/`).
  Сгенерированный файл не правится руками; добавить в `eslint.config.js` через
  `globalIgnores([...])` (сейчас игнорируется только `dist`).
- **Серверные артефакты** — в отдельную папку (например `server/generated/`),
  тоже в ignore линта.
- Сгенерированное **не коммитится** (или коммитится только как артефакт релиза),
  чтобы «руками не правилось» — правки вносятся только в `main.tsp`, затем
  `npm run generate`.

---

## 6. Пример минимального TypeSpec-контракта для проекта

```tsp
import "@typespec/http";
import "@typespec/openapi3";

using Http;
using OpenAPI;

@service(#{ title: "Календарь звонков" })
@server("http://localhost:3000", "Локальный сервер")
namespace Calendar;

// Слот — 30-минутный интервал, строка вида "2026-03-28-09:00"
model Slot {
  @minLength(1) value: string;
}

// Запрос на бронирование от гостя
model BookingCreate {
  @minLength(1) name: string;
  @format("email") email: string;
  @minLength(1) slot: string;
}

// Бронь — слот, зарезервированный гостем
model Booking {
  id: string;
  name: string;
  email: string;
  slot: string;
  createdAt: utcDateTime;
}

@route("/slots")
namespace Slots {
  // Гость смотрит свободные слоты на дату
  @get
  op list(@query date: string): {
    @statusCode statusCode: 200;
    @body slots: Slot[];
  };
}

@route("/bookings")
namespace Bookings {
  // Гость бронирует слот
  @post
  op create(@body body: BookingCreate): {
    @statusCode statusCode: 201;
    @body booking: Booking;
  } | {
    @statusCode statusCode: 409;   // слот уже занят
  };

  // Владелец смотрит брони
  @get
  op list(): {
    @statusCode statusCode: 200;
    @body bookings: Booking[];
  };
}
```

Этот контракт покрывает оба сценария: «гость бронирует слот» (`POST /bookings`) и
«владелец смотрит брони» (`GET /bookings`), плюс вспомогательный `GET /slots` для
списка свободных слотов.

---

## Источники

- TypeSpec getting started (REST): https://typespec.io/docs/getting-started/getting-started-rest/01-setup-basic-syntax/
- TypeSpec operations/responses: https://typespec.io/docs/getting-started/getting-started-rest/02-operations-responses/
- OpenAPI3 emitter: https://typespec.io/docs/emitters/openapi3/reference/emitter
- Client emitters (preview): https://typespec.io/docs/emitters/clients/introduction
- http-client-js: https://typespec.io/docs/emitters/clients/http-client-js/reference/emitter
- http-server-js (alpha): https://typespec.io/docs/emitters/servers/http-server-js/project/
- json-schema emitter: https://typespec.io/docs/emitters/json-schema/reference/
- orval: https://orval.dev
- Fastify TypeScript/type providers: https://fastify.dev/docs/latest/Reference/TypeScript
