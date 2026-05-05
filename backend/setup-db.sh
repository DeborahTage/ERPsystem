#!/bin/bash
# PostgreSQL Setup Script for Trust Agro ERP
# This script sets up PostgreSQL for local development

set -e

echo "=========================================="
echo "Trust Agro ERP - PostgreSQL Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Some operations may require sudo access${NC}"
fi

echo "Step 1: Checking PostgreSQL status..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo "   Attempting to start PostgreSQL..."
    sudo service postgresql start || sudo systemctl start postgresql
    sleep 2
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
        exit 1
    fi
fi

echo ""
echo "Step 2: Configuring authentication..."
echo "   Option A: Set postgres password to 'postgres'"
echo "   Option B: Use 'trust' authentication (no password)"
echo ""
read -p "Choose option (A/B) [B]: " choice
choice=${choice:-B}

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo "Setting postgres password to 'postgres'..."
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not set password automatically${NC}"
        echo "   Run manually: sudo -u postgres psql -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""
    }
    echo -e "${GREEN}✅ Password set to 'postgres'${NC}"
else
    echo "Configuring trust authentication..."
    PG_HBA=$(find /etc/postgresql -name "pg_hba.conf" 2>/dev/null | head -1)
    if [ -n "$PG_HBA" ]; then
        # Backup original
        sudo cp "$PG_HBA" "${PG_HBA}.backup"
        
        # Replace scram-sha-256 and peer with trust for localhost
        sudo sed -i 's/scram-sha-256/trust/g' "$PG_HBA"
        sudo sed -i 's/peer/trust/g' "$PG_HBA"
        sudo sed -i 's/md5/trust/g' "$PG_HBA"
        
        # Restart PostgreSQL
        sudo service postgresql restart || sudo systemctl restart postgresql
        echo -e "${GREEN}✅ Trust authentication configured${NC}"
        echo "   (No password required for local connections)"
    else
        echo -e "${YELLOW}⚠️  Could not find pg_hba.conf${NC}"
        echo "   PostgreSQL version may be different"
    fi
fi

echo ""
echo "Step 3: Creating database..."
if sudo -u postgres psql -l | grep -q "trust_agro_db"; then
    echo -e "${GREEN}✅ Database 'trust_agro_db' already exists${NC}"
else
    sudo -u postgres psql -c "CREATE DATABASE trust_agro_db;" && {
        echo -e "${GREEN}✅ Database 'trust_agro_db' created${NC}"
    } || {
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    }
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "You can now run the backend with:"
echo "  cd /home/kalilinux/Documents/ERp/Trust-ERP/backend"
echo "  ./run-dev.sh"
echo ""
echo "Or manually:"
echo "  mvn spring-boot:run"
echo ""
