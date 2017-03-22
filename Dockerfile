FROM node:6.9-onbuild

RUN npm run --silent build || true

EXPOSE 3001

CMD [ "npm", "run", "prod" ]