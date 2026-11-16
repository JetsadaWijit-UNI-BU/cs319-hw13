FROM node:26-alpine

# Install essential packages for development and DevContainer usage
RUN apk add --no-cache git bash curl sudo

# Set default user to 'node' which is included in the base image
USER node

# Set the default working directory
WORKDIR /workspace
