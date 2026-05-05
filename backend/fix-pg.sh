#!/bin/bash
# Fix PostgreSQL pg_hba.conf for trust authentication

sudo systemctl stop postgresql

# Write clean pg_hba.conf using printf (avoids heredoc issues)
sudo tee /etc/postgresql/18/main/pg_hba.conf > /dev/null <<'ENDOFFILE'
# PostgreSQL Client Authentication Configuration
# Trust authentication for local development

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local Unix socket - no password
local   all             all                                     trust

# IPv4 local - no password
host    all             all             127.0.0.1/32            trust

# IPv6 local - no password
host    all             all             ::1/128                 trust

# Replication
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
ENDOFFILE

echo "Config written. Starting PostgreSQL..."
sudo systemctl start postgresql
sleep 3

# Test
echo "Testing connection..."
psql -h 127.0.0.1 -U postgres -c "SELECT 'SUCCESS' as status;" 2>&1
