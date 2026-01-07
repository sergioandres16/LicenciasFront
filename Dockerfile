# ========================================
# Stage 1: Build con Node.js
# ========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build -- --configuration=production

# ========================================
# Stage 2: Runtime con nginx
# ========================================
FROM nginx:1.25-alpine

# Metadata
LABEL maintainer="sergio@salmoncorp.com"
LABEL description="SControl Licencias Frontend - Angular 19"
LABEL version="1.0.0"

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist/licencias-front/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
