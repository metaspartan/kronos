FROM node:12 as builder
WORKDIR /app
RUN git clone https://github.com/metaspartan/kronos.git
RUN cd kronos && \
    npm install

FROM node:12

COPY --from=builder /app/kronos /

EXPOSE 3000

CMD [ "npm", "run", "headless" ]