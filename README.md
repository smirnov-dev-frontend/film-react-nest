# FILM!

Онлайн-сервис бронирования билетов в кинотеатр: фронтенд на React и бэкенд на Nest.js.

Данные о фильмах, сеансах и бронированиях хранятся в PostgreSQL, работа с базой построена на TypeORM.

## Технологии

**Бэкенд:** Node.js, TypeScript, Nest.js 10, TypeORM 0.3 и PostgreSQL, class-validator и class-transformer, @nestjs/config, @nestjs/serve-static.

**Фронтенд:** React 18, TypeScript, Vite, SCSS-модули, Storybook.

**Инструменты:** ESLint, Prettier, Postman, GitHub Actions.

## API

| Метод | Эндпоинт | Описание |
|---|---|---|
| `GET` | `/api/afisha/films` | список фильмов с расписанием сеансов |
| `GET` | `/api/afisha/films/:id/schedule` | расписание сеансов фильма |
| `POST` | `/api/afisha/order` | бронирование билетов |
| `GET` | `/content/afisha/*` | статические файлы (афиши фильмов) |

Списки возвращаются в формате `{ total, items }`, ошибки — в формате `{ error }`. Полное описание API — в `film.yml` (OpenAPI), коллекция запросов — в `film.postman.json`.

## Структура бэкенда

```
backend/src/
├── main.ts                    точка входа: префикс /api/afisha, CORS, ValidationPipe
├── app.module.ts              корневой модуль: конфиг, статика, подключение БД
├── app.config.provider.ts     чтение и проверка переменных окружения
├── common/dto/                общий DTO ответа-списка ListResponseDto<T>
├── films/                     контроллер, сервис и DTO фильмов и сеансов
├── order/                     контроллер, сервис и DTO заказа
└── repository/
    ├── films.repository.ts    абстрактный FilmsRepository — интерфейс хранилища
    ├── films.mapper.ts        конвертеры сущностей БД в DTO
    └── postgres/              реализация на TypeORM: сущности Film и Schedule, модуль, репозиторий
```

## Реализация

**Слои.** Контроллеры только принимают запрос и передают его в сервис. Бизнес-логика находится в сервисах, а работа с базой — в репозиториях. Все зависимости внедряются через конструктор.

**Хранилище.** Сервисы зависят только от абстрактного `FilmsRepository`, а его реализацию на TypeORM предоставляет `PostgresModule`. Параметры подключения берутся из переменных окружения через `ConfigModule`. Если `DATABASE_DRIVER` не равен `postgres`, приложение не запускается и сообщает об ошибке.

**Модель данных.** Фильмы и сеансы хранятся в таблицах `films` и `schedules` со связью один-ко-многим через внешний ключ `filmId`. Занятые места хранятся в поле `taken` в формате `ряд:место`.

**Валидация.** Тело заказа проверяется декораторами class-validator в DTO и глобальным `ValidationPipe`: email, непустой список билетов, UUID фильма и сеанса, ряд и место — целые числа от 1. Лишние поля отбрасываются, некорректный запрос получает ответ 400.

**Бронирование.** Сервис проверяет, что сеанс существует, место есть в зале, не занято и не повторяется в заказе. Затем места записываются в транзакции с блокировкой строки сеанса. Поэтому одно место нельзя забронировать дважды даже при одновременных заказах. Время и цена в билетах берутся из базы, а не из запроса.

## Установка

### PostgreSQL

Установите PostgreSQL, скачав дистрибутив с официального сайта или с помощью пакетного менеджера вашей ОС, и запустите его.

От имени суперпользователя создайте пользователя и базу для проекта:

```
psql -U postgres -d postgres -c "CREATE ROLE prac LOGIN PASSWORD 'prac';"
psql -U postgres -d postgres -c "CREATE DATABASE prac OWNER prac;"
```

Создайте таблицы и заполните их тестовыми данными, выполнив из корня проекта:

```
psql -U postgres -d prac -f backend/test/prac.init.sql
psql -U postgres -d prac -f backend/test/prac.films.sql
psql -U postgres -d prac -f backend/test/prac.shedules.sql
```

Ошибку `database "prac" already exists` при выполнении `prac.init.sql` можно игнорировать: база уже создана на предыдущем шаге.

### Бэкенд

Перейдите в папку с исходным кодом бэкенда:

`cd backend`

Установите зависимости:

`npm ci`

Создайте `.env` файл из примера `.env.example`, в нём укажите:

* `PORT` — порт бэкенда, по умолчанию `3000`
* `DATABASE_DRIVER` — тип СУБД, `postgres`
* `DATABASE_HOST` — адрес сервера БД, по умолчанию `localhost`
* `DATABASE_PORT` — порт сервера БД, по умолчанию `5432`
* `DATABASE_NAME` — имя базы данных, по умолчанию `films`
* `DATABASE_USERNAME` — имя пользователя БД
* `DATABASE_PASSWORD` — пароль пользователя БД

PostgreSQL должна быть установлена и запущена.

Запустите бэкенд:

`npm run start:dev`

Для проверки отправьте тестовый запрос с помощью Postman (коллекция `film.postman.json`) или `curl`:

`curl http://localhost:3000/api/afisha/films`

### Фронтенд

Перейдите в папку с исходным кодом фронтенда:

`cd frontend`

Установите зависимости:

`npm i`

Создайте `.env` файл и укажите адрес локального бэкенда:

```
VITE_API_URL=http://localhost:3000/api/afisha
VITE_CDN_URL=http://localhost:3000/content/afisha
```

Запустите фронтенд в режиме разработки:

`npm run dev`

Приложение откроется по адресу `http://localhost:5173`.
