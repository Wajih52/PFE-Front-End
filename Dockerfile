# ===================================
# ÉTAPE 1 : BUILD - Construction de l'application Angular
# ===================================
FROM node:20-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration npm
COPY package*.json ./

# Installer les dépendances
# --legacy-peer-deps : pour éviter les conflits de versions
RUN npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Build de l'application Angular en mode production avec SSR
# Cela génère les fichiers dans dist/elegant-hive

# Build avec configuration optimisée pour Docker
RUN npm run build -- --configuration=docker




# ===================================
# ÉTAPE 2 : RUNTIME - Serveur Node.js pour SSR
# ===================================
FROM node:20-alpine

# Créer un utilisateur non-root
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

WORKDIR /app

# Copier le package.json pour installer uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copier les fichiers buildés depuis l'étape de build
COPY --from=build /app/dist ./dist

# Changer l'utilisateur
USER nodejs:nodejs

# Port exposé (4000 pour Angular SSR)
EXPOSE 4000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=4000

# Démarrer le serveur SSR
# Le fichier server.mjs est généré par Angular SSR
CMD ["node", "dist/agence-evenementielle-front/server/server.mjs"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000 || exit 1
