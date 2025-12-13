#!/bin/bash
echo "íº€ Starting Full Stack Deployment..."
echo "======================================"

# Backend Deployment
echo "í³¦ Deploying Backend (Node.js)..."
cd /root/mern-app/mernstack/sacc_server/source

# Kill any existing Node processes
pkill -f node 2>/dev/null || true

git pull origin main
npm install

# Stop and delete existing PM2 process
pm2 delete sacc-server 2>/dev/null || true

# Start with explicit port
PORT=5000 pm2 start ./bin/www --name "sacc-server"

# Wait a moment for server to start
sleep 3

# Verify server is running
if netstat -tln | grep :5000; then
    echo "âœ… Backend running on port 5000"
else
    echo "âŒ Backend failed to start on port 5000"
    echo "Checking for errors..."
    pm2 logs sacc-server --lines 20
    exit 1
fi

pm2 save
echo "âœ… Backend deployed successfully!"

# Frontend Deployment
echo "í³¦ Deploying Frontend (React)..."
cd /root/mern-app/mernstack/sacc_client
git pull origin main
npm install
npm run build

sudo rm -rf /var/www/sacc_client_build/*
sudo cp -r build/* /var/www/sacc_client_build/
sudo chown -R www-data:www-data /var/www/sacc_client_build/
sudo chmod -R 755 /var/www/sacc_client_build/
echo "âœ… Frontend built successfully!"

# Reload Nginx
echo "í´„ Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "âœ… Nginx reloaded!"

# Test the API
echo "Testing API connection..."
sleep 2
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "âœ… API is working on port 5000"
else
    echo "âŒ API test failed - checking logs..."
    pm2 logs sacc-server --lines 10
fi

echo "======================================"
echo "í¾‰ Deployment completed!"
