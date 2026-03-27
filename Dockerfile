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
 
# Stage de production
FROM node:20-alpine
 
WORKDIR /app
 
# Copier package.json pour réinstaller uniquement les dépendances de prod
COPY --from=builder /app/apps/api/package*.json ./
 
# Installer uniquement les dépendances de production
RUN npm ci --omit=dev
 
# Copier le build et Prisma
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/src/generated ./src/generated
 
# Générer Prisma Client en production
RUN npx prisma generate
 
# Exposer le port
EXPOSE 3000
 
# Démarrer l'application
CMD ["node", "dist/main"]