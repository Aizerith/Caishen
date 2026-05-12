# Docker

## Demarrage

```powershell
docker compose --env-file .env up -d --build
```

Applications disponibles :

- Frontend : `http://127.0.0.1:9003`
- URL publique : `https://caishen.laurent-chen.fr`
- Backend API : reseau Docker interne uniquement, proxifie par le frontend nginx via `/api`
- MariaDB : reseau Docker interne uniquement

Le frontend nginx proxifie `/api/` vers le backend en retirant le prefixe `/api`, comme dans l'ancien projet CaiShen. Les WebSockets passent par `/api/ws/`.

Sur le serveur dedie, le reverse proxy HTTPS doit pointer `caishen.laurent-chen.fr` vers `http://127.0.0.1:9003`.

## Arret

```powershell
docker compose --env-file .env down
```

Pour supprimer aussi la base locale :

```powershell
docker compose --env-file .env down -v
```

## Configuration

Variables utiles :

- `DB_PASSWORD` : mot de passe de l'utilisateur MariaDB `caishen`
- `MARIADB_ROOT_PASSWORD` : mot de passe root MariaDB
- `JWT_SECRET` : secret de signature JWT
- `FRONTEND_BASE_URL` : URL publique du frontend
- `CAISHEN_FRONTEND_PORT` : port local publie par le frontend, `9003` par defaut

Flyway applique automatiquement les migrations au demarrage du backend.
