# Deployment Guide

## Prerequisites

Before deploying, ensure:
- [ ] All environment variables are configured
- [ ] MongoDB database is accessible
- [ ] Email service is configured
- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)

## Environment Variables

Set these in your deployment platform:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-strong-secret-here
NODE_ENV=production
PORT=5000
BACKEND_BASEURL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
LOG_LEVEL=info
```

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add FRONTEND_URL
# ... add all other variables
```

Or set them in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables

### 5. Deploy to Production
```bash
vercel --prod
```

### Important Notes for Vercel

⚠️ **File Uploads**: Vercel is serverless and doesn't support persistent file storage. You must use cloud storage:

#### Option 1: Cloudinary (Recommended)
```bash
npm install cloudinary multer-storage-cloudinary
```

Update `middleware/upload.js`:
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'events',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
```

#### Option 2: AWS S3
```bash
npm install aws-sdk multer-s3
```

## Heroku Deployment

### 1. Install Heroku CLI
```bash
npm install -g heroku
```

### 2. Login
```bash
heroku login
```

### 3. Create App
```bash
heroku create your-app-name
```

### 4. Set Environment Variables
```bash
heroku config:set MONGO_URI="your-mongo-uri"
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV="production"
# ... set all other variables
```

### 5. Deploy
```bash
git push heroku main
```

### 6. Check Logs
```bash
heroku logs --tail
```

## AWS EC2 Deployment

### 1. Launch EC2 Instance
- Choose Ubuntu Server 22.04 LTS
- Instance type: t2.micro (or larger)
- Configure security group (ports 22, 80, 443, 5000)

### 2. Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4. Install PM2
```bash
sudo npm install -g pm2
```

### 5. Clone Repository
```bash
git clone your-repo-url
cd eth-volunteer-backend
```

### 6. Install Dependencies
```bash
npm install --production
```

### 7. Create .env File
```bash
nano .env
# Add all environment variables
```

### 8. Start with PM2
```bash
pm2 start server.js --name eth-volunteer-api
pm2 save
pm2 startup
```

### 9. Set Up Nginx (Optional)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

### 10. Set Up SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### 2. Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

### 3. Build Image
```bash
docker build -t eth-volunteer-api .
```

### 4. Run Container
```bash
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name eth-volunteer-api \
  eth-volunteer-api
```

### 5. Docker Compose (Optional)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

Run:
```bash
docker-compose up -d
```

## Post-Deployment Checklist

- [ ] Health check endpoint works: `GET /health`
- [ ] API responds correctly: `GET /`
- [ ] Authentication works
- [ ] Database connection is stable
- [ ] Email notifications work
- [ ] File uploads work (if using cloud storage)
- [ ] CORS is configured correctly
- [ ] Rate limiting is active
- [ ] Logs are being generated
- [ ] Error handling works
- [ ] SSL certificate is valid (if using HTTPS)

## Monitoring

### Check Application Health
```bash
curl https://your-api-domain.com/health
```

### View Logs (Vercel)
```bash
vercel logs
```

### View Logs (Heroku)
```bash
heroku logs --tail
```

### View Logs (PM2)
```bash
pm2 logs eth-volunteer-api
```

### View Logs (Docker)
```bash
docker logs eth-volunteer-api
```

## Troubleshooting

### Issue: Server won't start
**Check**:
- Environment variables are set
- MongoDB connection string is correct
- Port is not already in use

### Issue: CORS errors
**Check**:
- `FRONTEND_URL` is set correctly
- Frontend is using correct API URL

### Issue: File uploads fail
**Check**:
- Using cloud storage (Cloudinary/S3)
- Upload middleware is configured correctly
- File size limits

### Issue: Email notifications fail
**Check**:
- Email credentials are correct
- Using app-specific password for Gmail
- Email service is not blocked

## Rollback

### Vercel
```bash
vercel rollback
```

### Heroku
```bash
heroku releases
heroku rollback v123
```

### PM2
```bash
git checkout previous-commit
pm2 restart eth-volunteer-api
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple instances
- Use Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layer

## Backup

### Database Backup
```bash
mongodump --uri="your-mongo-uri" --out=/backup/$(date +%Y%m%d)
```

### Automated Backups
Set up cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Security Checklist

- [ ] Environment variables are not committed
- [ ] JWT secret is strong and unique
- [ ] Database has authentication enabled
- [ ] HTTPS is enabled
- [ ] Rate limiting is active
- [ ] Input validation is working
- [ ] CORS is properly configured
- [ ] Security headers are set (Helmet)
- [ ] Dependencies are up to date
- [ ] Logs don't contain sensitive data

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Test locally with production settings
- Contact support if needed
