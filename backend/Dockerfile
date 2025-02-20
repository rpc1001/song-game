# syntax=docker/dockerfile:1

##
# === Stage 1: Local development environment
##
FROM node:18-alpine AS local
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Expose port for local usage
EXPOSE 3000

# Command to run in local mode
CMD ["node", "server.js"]


##
# === Stage 2: AWS Lambda environment
##
FROM public.ecr.aws/lambda/nodejs:18-x86_64 AS lambda
WORKDIR /var/task

# Copy production dependencies and source code from the local stage
COPY --from=local /app /var/task

# Set the handler (matches the export in server.js)
CMD ["server.handler"]