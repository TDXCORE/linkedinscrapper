# Base sin navegador (Node 20)
FROM apify/actor-node:20

WORKDIR /usr/src/app

# Instalar deps con caché eficiente
COPY package*.json ./
# Si hay lockfile usa ci; si no, instala normal (evita fallos por falta de lock)
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --omit=dev ; \
    else \
      npm install --omit=dev ; \
    fi

# Copia el resto del código
COPY . ./

# Ejecuta el actor (la imagen base espera npm start)
CMD ["npm","start","--silent"]
