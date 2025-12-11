FROM node:18-alpine

WORKDIR /app

# Build argument for API URL (defaults to production)
ARG VITE_API_URL=https://api.ioio.cl/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
