# Video Processing App (MERN + Socket.IO)

## Features
- JWT Authentication
- Role-based access (viewer, editor, admin)
- Video upload (Multer)
- Real-time processing (Socket.IO)
- Secure video streaming (Range requests)

## Tech Stack
- Frontend: React, Tailwind
- Backend: Node.js, Express
- Database: MongoDB
- Realtime: Socket.IO

## Setup

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm start

## Environment Variables
MONGO_URI=your_mongo
JWT_SECRET=your_secret

## API Routes
POST /api/auth/login  
POST /api/videos/upload  
GET /api/videos  
GET /api/videos/stream/:filename  

## Future Improvements
- AWS S3 storage
- FFmpeg real processing
- Redis queue
