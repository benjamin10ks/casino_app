import { express } from 'express';
import { createServer } from 'http';
import { initSocketServer } from './socketServer'; 

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


