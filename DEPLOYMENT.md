# Деплой Film!

Памятка для работы с настроенным сервером. Адреса приложения указаны в [README](README.md#развёрнутое-приложение).

## Подключение

С локального устройства:

```bash
ssh -i ~/.ssh/id_ed25519 alexsmirnov@158.160.138.162
```

На сервере проект находится в `~/film-react-nest`. Файл `docker-compose.yml` — копия `docker-compose.prod.yml` из репозитория, параметры и пароли хранятся в серверном `.env`.

## Запуск и обновление

После успешной сборки образов в GitHub Actions выполните на сервере:

```bash
cd ~/film-react-nest
sudo docker compose pull &&
sudo docker compose up -d --force-recreate frontend &&
sudo docker compose up -d backend nginx pgadmin &&
sudo docker compose up -d --no-deps --force-recreate nginx &&
sudo docker compose ps -a
```

`frontend` обновляет сборку в общем томе и завершается с кодом 0. Остальные контейнеры должны работать. Пересоздание nginx обновляет адрес бэкенда после замены его контейнера.

При изменении Compose или конфигов сначала перенесите их на сервер. Активный HTTPS-конфиг находится в `nginx/conf.d/default.conf`. Серверный `.env` при обновлении сохраняют.

## Наполнение базы через pgAdmin

На локальном устройстве откройте туннель и оставьте SSH-сессию подключённой:

```bash
ssh -i ~/.ssh/id_ed25519 -o ExitOnForwardFailure=yes -L 18080:127.0.0.1:8080 alexsmirnov@158.160.138.162
```

Откройте http://localhost:18080. Для входа используйте `PGADMIN_DEFAULT_EMAIL` и `PGADMIN_DEFAULT_PASSWORD` из серверного `.env`. Подключение к PostgreSQL: хост `database`, порт `5432`, база и пользователь `prac`, пароль — `POSTGRES_PASSWORD`.

На новой базе `prac` через Query Tool однократно выполните:

1. `backend/test/prac.init.sql`, пропустив в редакторе команду `create database prac with owner prac;`: контейнер уже создал базу.
2. `backend/test/prac.films.sql` целиком.
3. `backend/test/prac.shedules.sql` целиком.

Ожидается 6 фильмов и 54 сеанса. Исходные SQL-файлы остаются без изменений. Порт pgAdmin доступен только через туннель.

## Проверка приложения

```bash
curl -I http://film-smirnov.students.nomorepartiessite.ru/
curl -I https://film-smirnov.students.nomorepartiessite.ru/
curl -fsS https://api.film-smirnov.students.nomorepartiessite.ru/api/afisha/films | python3 -c 'import json, sys; print(json.load(sys.stdin)["total"])'
```

Ожидается редирект 301, ответ 200 и число 6. Логи: `sudo docker compose logs --tail=100 backend nginx`.

## Продление сертификата

Certbot автоматически продлевает сертификат через `certbot.timer`. Скрипт `nginx/reload-after-renewal.sh` установлен в `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh` и перезагружает nginx после продления.

Проверка на сервере:

```bash
sudo certbot renew --dry-run --run-deploy-hooks
```
