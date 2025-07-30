# set a password (dev only, hard-coded here for brevity)
docker run -d --name redis -p 6379:6379 redis:7 \
  redis-server --requirepass "s3cretPass!"
