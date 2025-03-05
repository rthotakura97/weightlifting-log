#!/bin/bash

# Database Name
DB_NAME="weightlifting_log_db"

# SQL command to list tables
SQL_COMMAND="SELECT name FROM sqlite_master WHERE type='table';"

echo "Checking tables in LOCAL D1 database..."
wrangler d1 execute $DB_NAME --command "$SQL_COMMAND"

echo ""
echo "Checking tables in REMOTE D1 database..."
wrangler d1 execute $DB_NAME --command "$SQL_COMMAND" --remote
