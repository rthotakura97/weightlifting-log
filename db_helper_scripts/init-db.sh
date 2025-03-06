#!/bin/bash

# Database Name
DB_NAME="weightlifting_log_db"

# Run for LOCAL development
echo "Initializing D1 database locally..."
wrangler d1 execute $DB_NAME --file=001_init.sql

# Run for REMOTE (Cloudflare) deployment
echo "Initializing D1 database on Cloudflare..."
wrangler d1 execute $DB_NAME --file=001_init.sql --remote
