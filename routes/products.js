import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Funciones para leer y escribir archivos JSON
const readJSONFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJSONFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Ruta GET para listar todos los productos
router.get('/', async (req, res) => {
  const products = await readJSONFile(productsFilePath);
  const { limit } = req.query;
  res.json(limit ? products.slice(0, limit) : products);
});

// Ruta GET para obtener un producto por ID
router.get('/:pid', async (req, res) => {
  const products = await readJSONFile(productsFilePath);
  const product = products.find(p => p.id === req.params.pid);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Ruta POST para agregar un nuevo producto
router.post('/', async (req, res) => {
  // Extraemos los campos obligatorios del cuerpo de la solicitud
  const { title, description, code, price, stock, category } = req.body;

  // Validamos que todos los campos obligatorios estén presentes
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Todos los campos excepto thumbnails son obligatorios' });
  }

  // Si la validación pasa, procedemos a crear el nuevo producto
  const products = await readJSONFile(productsFilePath);
  const newProduct = {
    id: (products.length + 1).toString(), // Genera un ID único
    title,
    description,
    code,
    price,
    status: req.body.status ?? true,
    stock,
    category,
    thumbnails: req.body.thumbnails || []
  };
  products.push(newProduct);
  await writeJSONFile(productsFilePath, products);
  res.status(201).json(newProduct);
});

// Ruta PUT para actualizar un producto por ID
router.put('/:pid', async (req, res) => {
  const products = await readJSONFile(productsFilePath);
  const index = products.findIndex(p => p.id === req.params.pid);
  if (index !== -1) {
    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;
    await writeJSONFile(productsFilePath, products);
    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Ruta DELETE para eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
  let products = await readJSONFile(productsFilePath);
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.pid);
  if (products.length < initialLength) {
    await writeJSONFile(productsFilePath, products);
    res.json({ message: 'Producto eliminado' });
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

export default router;
