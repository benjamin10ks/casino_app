import { express } from 'express';
import { createServer } from 'http';
//not implemetened yet
//import { initSocketServer } from './socketServer'; 

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

//initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


