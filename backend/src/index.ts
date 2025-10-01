import express ,{Request,Response}from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3001;

app.get('/', (req:Request, res:Response) => {
  res.send('¡Hola desde el backend de Share Musician!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Mantener el proceso activo en entornos donde se cierra prematuramente
