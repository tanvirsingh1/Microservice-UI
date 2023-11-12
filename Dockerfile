#stage 0: Intsall base dependencies
# Use an official Node.js runtime as a parent image
FROM node:18.13.0-alpine@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS dependencies


# Define maintainer and description labels for the image metadata
LABEL maintainer="Tanvir Singh <tanvir-Singh1@myseneca.ca>" \
      description="Fragments-ui Web app"

# Set environment variables for npm to reduce the verbosity of the logs and to disable color in the output
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /App
# Copy package.json and package-lock.json (or npm-shrinkwrap.json) to the working directory
COPY package* ./

# Install dependencies defined in package-lock.json without modifying it (for reproducible builds)
RUN npm ci 

#Stage 1

#######################################################################################
FROM node:18.13.0-alpine@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS build

WORKDIR /App
#Copying node_modules from dependecies stage
COPY --from=dependencies /App /App
# copy from source code
COPY . .
#Build the site
RUN npm run build

#Stage 3 serving the built site
FROM nginx:1.25.3-alpine@sha256:db353d0f0c479c91bd15e01fc68ed0f33d9c4c52f3415e63332c3d0bf7a4bb77 AS deploy
COPY --from=build /App/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3\
   CMD curl --fail localhost:80 || exit 1


