# ShinCaishen

Reprise du projet CaiShen sur le boilerplate Spring Boot + Angular modernise.

## Stack

- Angular 21
- Spring Boot 4
- Java 21
- MariaDB
- Flyway
- Spring Security + JWT
- WebSocket STOMP
- Tailwind CSS + DaisyUI
- Docker Compose

## Structure

- `frontend` : application Angular CaiShen migree depuis l'ancien dossier `client`
- `backend` : API Spring Boot CaiShen migree depuis l'ancien dossier `server`
- `docker-compose.yml` : stack locale avec MariaDB, backend et frontend nginx

## Lancer en local

### Frontend

```powershell
cd frontend
npm install
npm run build
npm start
```

Le frontend de developpement demarre sur `http://localhost:4200`.

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Le backend demarre sur `http://localhost:8080`.

### Docker

```powershell
docker compose up --build
```

Variables utiles en production :

- `DB_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_BASE_URL`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

## Verification

Commandes utilisees apres migration :

```powershell
cd backend
.\mvnw.cmd -q -DskipTests package

cd ..\frontend
npm run build
```
