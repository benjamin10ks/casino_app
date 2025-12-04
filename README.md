# CSCI331 Final Project

Ideas

- GAMBLING
  - [ ] poker(texas hold em)
  - [x] blackjack?
  - [x] betting, dealing, hitting, standing, busting, blackjack
  - [ ] roulette
  - [ ] slots
  - [ ] RIDE THE BUS

- [x] account creation/login
- [x] guest accounts
- [x] Chat feature
- [x] Lobby selection

# Stack

- Frontend: React/Vite
- Backend: Node.js, Express, Socket.io
- Database: PostgreSQL

# How to Run

While in the casino_app directory:

create a `.env` file based on the `.env.example` file in apps/server

`npm install` to install dependencies

NEED TO FIGURE OUT AUTO MIGRATIONS FOR POSTGRES
FOR NOW `npm run start:db` and `node scripts/migrate.js` to set up DB

THEN

`npm run dev` to start client server and DB server

That's it!
