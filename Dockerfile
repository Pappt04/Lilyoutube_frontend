# Stage 1: Build the application
FROM node:22 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application
FROM node:22-alpine

WORKDIR /app

# Copy the build output from the build stage
# Angular SSR puts the server and browser files in dist/lilyoutube-frontend
COPY --from=build /app/dist/lilyoutube-frontend ./dist/lilyoutube-frontend

# Expose the port the app runs on (standard for Angular SSR)
ENV PORT=4000
EXPOSE 4000

# Command to run the SSR server
CMD ["node", "dist/lilyoutube-frontend/server/server.mjs"]
