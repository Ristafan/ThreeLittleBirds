# stage 1: build the frontend application
FROM node:22.2.0-alpine AS builder

WORKDIR /app

# copy package files first to leverage docker caching
COPY package.json package-lock.json* ./

# install exact dependencies based on lockfile
RUN npm ci

# copy the rest of the source code
COPY . .

# build the production assets
RUN npm run build

# stage 2: serve the production assets with nginx
FROM nginx:1.27.0-alpine

# copy built assets from the builder stage
# note: adjust 'dist' if webpack outputs to 'build' or another folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]