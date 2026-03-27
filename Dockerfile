FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY package*.json ./
COPY tsconfig.base.json ./

# Copier l'API
COPY apps/api ./apps/api

# Installer les dépendances depuis le dossier API
WORKDIR /app/apps/api
RUN npm ci

# Générer Prisma Client
RUN npx prisma generate

# Build l'application
RUN npm run build

# Vérifier que dist existe
RUN ls -la dist/

# Stage de production
FROM node:20-alpine

WORKDIR /app

# Copier package.json ET package-lock.json
COPY --from=builder /app/apps/api/package.json ./


# Installer les dépendances de production (sans package-lock)
RUN npm install --production --no-package-lock

# Copier le build et Prisma
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/src/generated ./src/generated

# Générer Prisma Client en production
RUN npx prisma generate

# Vérifier les fichiers copiés
RUN ls -la
RUN ls -la dist/
 
# Exposer le port
EXPOSE 3000
 
# Démarrer l'application
CMD ["node", "dist/main.js"]