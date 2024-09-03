import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const cartsFilePath = path.resolve('data', 'carrito.json');
const productsFilePath = path.resolve('data', 'productos.json');

// Función para leer los archivos JSON
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Función para escribir en los archivos JSON
const writeJSONFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Ruta POST para crear un nuevo carrito
router.post('/', async (req, res) => {
  const carts = await readJSONFile(cartsFilePath);
  const newCart = {
    id: (carts.length + 1).toString(), // Genera un ID único
    products: []
  };
  carts.push(newCart);
  await writeJSONFile(cartsFilePath, carts);
  res.status(201).json(newCart);
});

// Ruta GET para obtener productos de un carrito por ID
router.get('/:cid', async (req, res) => {
  const carts = await readJSONFile(cartsFilePath);
  const cart = carts.find(c => c.id === req.params.cid);
  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

// Ruta POST para agregar un producto a un carrito por ID
router.post('/:cid/product/:pid', async (req, res) => {
  const carts = await readJSONFile(cartsFilePath);
  const products = await readJSONFile(productsFilePath);
  const cart = carts.find(c => c.id === req.params.cid);
  const product = products.find(p => p.id === req.params.pid);

  if (cart && product) {
    const existingProduct = cart.products.find(p => p.product === req.params.pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }
    await writeJSONFile(cartsFilePath, carts);
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Carrito o producto no encontrado' });
  }
});

export default router;
