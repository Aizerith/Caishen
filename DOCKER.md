# Docker

## Demarrage

```powershell
docker compose up --build
```

Applications disponibles :

- Frontend : `http://localhost:4200`
- Backend API : `http://localhost:8080`
- MariaDB : `localhost:3406`

Le frontend nginx proxifie `/api/` vers le backend en retirant le prefixe `/api`, comme dans l'ancien projet CaiShen. Les WebSockets passent par `/api/ws/`.

## Arret

```powershell
docker compose down
```

Pour supprimer aussi la base locale :

```powershell
docker compose down -v
```

## Configuration

Variables utiles :

- `DB_PASSWORD` : mot de passe de l'utilisateur MariaDB `caishen`
- `MARIADB_ROOT_PASSWORD` : mot de passe root MariaDB
- `JWT_SECRET` : secret de signature JWT
- `FRONTEND_BASE_URL` : URL publique du frontend

Flyway applique automatiquement les migrations au demarrage du backend.
