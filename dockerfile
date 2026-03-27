FROM node:20-alpine AS builder
 
WORKDIR /app
 
# Copier les fichiers de configuration du monorepo
COPY package*.json ./
COPY tsconfig.base.json ./
 
# Copier l'API
COPY apps/api ./apps/api
 
# Installer les dépendances
WORKDIR /app/apps/api
RUN npm ci
 
# Générer Prisma Client
RUN npx prisma generate
 
# Build l'application
RUN npm run build
 
# Stage de production
FROM node:20-alpine
 
WORKDIR /app
 
# Copier les dépendances et le build
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
 
# Exposer le port
EXPOSE 3000
 
# Démarrer l'application
CMD ["node", "dist/main"]