============================================
GITHUB
============================================

GitHub Repository:
https://github.com/Fluffyboyyy/Luminary-IMY220-

============================================
DOCKER COMMANDS 
============================================

BUILD IMAGES:
cd frontend && docker build -t luminary-frontend .
cd ../backend && docker build -t luminary-backend .
docker compose up -d --build

RUN CONTAINERS:
docker run -d -p 5000:5000 -e MONGO_URI="mongodb://u25071247_db_user:zWsfA79FEEFKawIP@ac-sfyp4jd-shard-00-00.f1khihi.mongodb.net:27017,ac-sfyp4jd-shard-00-01.f1khihi.mongodb.net:27017,ac-sfyp4jd-shard-00-02.f1khihi.mongodb.net:27017/?ssl=true&replicaSet=atlas-wenta0-shard-0&authSource=admin&appName=Luminary" --name luminary-backend luminary-backend
docker run -d -p 5173:5173 --name luminary-frontend luminary-frontend
docker compose up -d

EXTRA RUN COMMANDS:
docker run -d -p 0.0.0.0:5000:5000 -e MONGO_URI="mongodb://u25071247_db_user:zWsfA79FEEFKawIP@ac-sfyp4jd-shard-00-00.f1khihi.mongodb.net:27017,ac-sfyp4jd-shard-00-01.f1khihi.mongodb.net:27017,ac-sfyp4jd-shard-00-02.f1khihi.mongodb.net:27017/?ssl=true&replicaSet=atlas-wenta0-shard-0&authSource=admin&appName=Luminary" --name luminary-backend luminary-backend
docker run -d -p 0.0.0.0:5173:5173 --name luminary-frontend luminary-frontend

STOP DOCKER COMMANDS:
docker compose down

============================================
ACCESS THE APPLICATION
============================================

Frontend: http://localhost:5173
Backend API: http://localhost:5000

============================================
TEST ACCOUNTS
============================================

Regular user:  test@test.com    / test1234
Admin:         admin@test.com   / admin1234
Other users:   alice@example.com / alice1234
               bob@example.com   / bob1234