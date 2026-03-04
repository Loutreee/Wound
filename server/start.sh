#!/bin/sh
cd /app && node src/db/init.js && exec node src/index.js
