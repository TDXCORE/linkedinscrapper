FROM apify/actor-node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --omit=dev ; \
    else \
      npm install --omit=dev ; \
    fi
COPY . ./
CMD ["npm","start","--silent"]
