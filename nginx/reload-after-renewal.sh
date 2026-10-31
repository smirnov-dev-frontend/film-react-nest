#!/bin/sh
set -eu

cd /home/alexsmirnov/film-react-nest
/usr/bin/docker compose exec -T nginx nginx -t
/usr/bin/docker compose exec -T nginx nginx -s reload
