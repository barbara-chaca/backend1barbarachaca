import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
app.use(express.json());

// Ruta para manejar el GET en la raíz (localhost:8080)
app.get('/', (req, res) => {
  res.send('¡Bienvenido! Página en construcción');
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Puerto donde escucha el servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
