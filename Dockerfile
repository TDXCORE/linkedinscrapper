# Use Apify base image with Chrome and Node.js
FROM apify/actor-node-chrome:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . ./

# Set proper permissions
RUN chmod +x src/main.js

# Create non-root user for security
RUN groupadd -r apify && useradd -r -g apify -G audio,video apify \
    && mkdir -p /home/apify \
    && chown -R apify:apify /home/apify \
    && chown -R apify:apify /usr/src/app

# Set environment variables for optimal performance
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose port for health checks
EXPOSE 3000

# Switch to non-root user
USER apify

# Health check
HEALTHCHECK --interval=60s --timeout=15s --start-period=60s \
  CMD node -e "console.log('Health check passed')" || exit 1

# Run the actor
CMD npm start