#!/bin/bash
# Backend development runner script
# Usage: ./run-dev.sh [password]

DB_PASS=${1:-postgres}

echo "=========================================="
echo "Trust Agro ERP - Development Server"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "   Start it with: sudo service postgresql start"
    exit 1
fi
echo "✅ PostgreSQL is running"

# Check if database exists
if ! PGPASSWORD="$DB_PASS" psql -h localhost -U postgres -l | grep -q "trust_agro_db"; then
    echo "⚠️  Database 'trust_agro_db' not found"
    echo "   Creating database..."
    PGPASSWORD="$DB_PASS" psql -h localhost -U postgres -c "CREATE DATABASE trust_agro_db;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Failed to create database"
        echo "   Try: sudo -u postgres psql -c \"CREATE DATABASE trust_agro_db;\""
        exit 1
    fi
else
    echo "✅ Database 'trust_agro_db' exists"
fi

echo ""
echo "🚀 Starting Spring Boot application..."
echo "   Database password: $DB_PASS"
echo ""

# Run with the provided password
DB_PASSWORD="$DB_PASS" mvn spring-boot:run
