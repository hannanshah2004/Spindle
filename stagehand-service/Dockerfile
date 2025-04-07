# Use an official Node.js runtime as a parent image (Choose LTS version)
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install necessary dependencies for Playwright browsers
# Update package lists and install dependencies
RUN apt-get update && apt-get install -y \
    # Common dependencies
    wget \
    unzip \
    # Dependencies for Chromium
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    # Recommended dependencies for headed mode (might not be needed if always headless)
    # libfontconfig1 \
    # libfreetype6 \
    # libxshmfence1 \
    # --force-yes might be needed sometimes, but use with caution
    --no-install-recommends \
    # Clean up apt cache to reduce image size
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
# Use --frozen-lockfile for reproducible builds if you have a lock file
RUN npm install --frozen-lockfile 

# Install Playwright browsers. This command reads the required version from package.json
# Use --with-deps to install OS dependencies automatically (alternative to manual apt-get above, but manual is often more reliable/controlled)
RUN npx playwright install --with-deps chromium 
# If you need other browsers, add them here e.g.: firefox webkit

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variables (optional, can be set at runtime)
# ENV OPENAI_API_KEY=your_api_key_here 
# ENV STAGEHAND_MODEL_NAME=gpt-4o
# ENV STAGEHAND_HEADLESS=true 
# ENV NODE_ENV=production

# Run the server when the container launches
CMD ["node", "dist/server.js"] 