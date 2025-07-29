#!/bin/sh
echo "Waiting for MySQL..."
while ! nc -z db 3306; do
  sleep 0.1
done
echo "MySQL is up - executing migration"
./migrate
if [ $? -eq 0 ]; then
  echo "Migration successful - starting server"
  ./server
else
  echo "Migration failed"
  exit 1
fi