
# Use Debian for LibreOffice support
FROM oven/bun:1.1.6 as base

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

# Set working dir
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN bun install

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "server.ts"]

