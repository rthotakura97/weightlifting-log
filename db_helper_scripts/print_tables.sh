#!/bin/bash

# Database Name
DB_NAME="weightlifting_log_db"

# Usage Message
if [ "$#" -lt 2 ]; then
    echo "Usage: ./print-tables.sh <table_name> <local|remote>"
    exit 1
fi

# Arguments
TABLE_NAME=$1
ENVIRONMENT=$2

# SQL command to print table contents
SQL_COMMAND="SELECT * FROM $TABLE_NAME;"

# Check environment and execute command
if [ "$ENVIRONMENT" == "local" ]; then
    echo "Fetching contents of '$TABLE_NAME' from LOCAL D1 database..."
    wrangler d1 execute $DB_NAME --command "$SQL_COMMAND"
elif [ "$ENVIRONMENT" == "remote" ]; then
    echo "Fetching contents of '$TABLE_NAME' from REMOTE D1 database..."
    wrangler d1 execute $DB_NAME --command "$SQL_COMMAND" --remote
else
    echo "Invalid environment! Use 'local' or 'remote'."
    exit 1
fi
