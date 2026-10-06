============================================
GITHUB
============================================

GitHub Repository:
https://github.com/GaryMull1/Luminary-IMY220-

============================================
DOCKER COMMANDS 
============================================

BUILD IMAGES:
cd frontend && docker build -t luminary-frontend .
cd ../backend && docker build -t luminary-backend .

RUN CONTAINERS:
docker run -d -p 5000:5000 --name luminary-backend luminary-backend
docker run -d -p 5173:5173 --name luminary-frontend luminary-frontend

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
