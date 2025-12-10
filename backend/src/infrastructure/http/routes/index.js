const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Repositories
const PostgresUserRepository = require('../../repositories/PostgresUserRepository');
const PostgresProductRepository = require('../../repositories/PostgresProductRepository');
const PostgresOrderRepository = require('../../repositories/PostgresOrderRepository');
const PostgresCartRepository = require('../../repositories/PostgresCartRepository');
const PostgresCategoryRepository = require('../../repositories/PostgresCategoryRepository');
const PostgresBannerRepository = require('../../repositories/PostgresBannerRepository');
const PostgresEventRepository = require('../../repositories/PostgresEventRepository');
const PostgresExperimentRepository = require('../../repositories/PostgresExperimentRepository');
const PostgresCompanyInfoRepository = require('../../repositories/PostgresCompanyInfoRepository');

// Controllers
const AuthController = require('../controllers/AuthController');
const ProductController = require('../controllers/ProductController');
const OrderController = require('../controllers/OrderController');
const CartController = require('../controllers/CartController');
const CategoryController = require('../controllers/CategoryController');
const ContentController = require('../controllers/ContentController');
const UploadController = require('../controllers/UploadController');
const multer = require('multer');

function setupRoutes(app) {
  const router = express.Router();

  // Initialize repositories
  const userRepository = new PostgresUserRepository();
  const productRepository = new PostgresProductRepository();
  const orderRepository = new PostgresOrderRepository();
  const cartRepository = new PostgresCartRepository();
  const categoryRepository = new PostgresCategoryRepository();
  const bannerRepository = new PostgresBannerRepository();
  const eventRepository = new PostgresEventRepository();
  const experimentRepository = new PostgresExperimentRepository();
  const companyInfoRepository = new PostgresCompanyInfoRepository();

  // Initialize controllers
  const authController = new AuthController(userRepository);
  const productController = new ProductController(productRepository);
  const orderController = new OrderController(orderRepository, productRepository, cartRepository);
  const cartController = new CartController(cartRepository);
  const categoryController = new CategoryController(categoryRepository);
  const contentController = new ContentController(
    bannerRepository,
    eventRepository,
    experimentRepository,
    companyInfoRepository
  );
  const uploadController = new UploadController();

  // Configure multer for multiple files
  const uploadMultiple = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only images allowed'), false);
    }
  }).array('images', 10);

  // Auth routes
  router.post('/auth/register', (req, res) => authController.register(req, res));
  router.post('/auth/login', (req, res) => authController.login(req, res));
  router.get('/auth/me', authMiddleware, (req, res) => authController.me(req, res));

  // Product routes
  router.get('/products', (req, res) => productController.getAll(req, res));
  router.get('/products/:id', (req, res) => productController.getById(req, res));
  router.post('/products', authMiddleware, adminMiddleware, (req, res) => 
    productController.create(req, res));
  router.put('/products/:id', authMiddleware, adminMiddleware, (req, res) => 
    productController.update(req, res));
  router.delete('/products/:id', authMiddleware, adminMiddleware, (req, res) => 
    productController.delete(req, res));

  // Category routes
  router.get('/categories', (req, res) => categoryController.getAll(req, res));
  router.get('/categories/:id', (req, res) => categoryController.getById(req, res));
  router.post('/categories', authMiddleware, adminMiddleware, (req, res) => 
    categoryController.create(req, res));
  router.put('/categories/:id', authMiddleware, adminMiddleware, (req, res) => 
    categoryController.update(req, res));
  router.delete('/categories/:id', authMiddleware, adminMiddleware, (req, res) => 
    categoryController.delete(req, res));

  // Cart routes
  router.get('/cart', (req, res) => cartController.getCart(req, res));
  router.post('/cart/items', (req, res) => cartController.addItem(req, res));
  router.put('/cart/items/:id', (req, res) => cartController.updateQuantity(req, res));
  router.delete('/cart/items/:id', (req, res) => cartController.removeItem(req, res));
  router.delete('/cart', (req, res) => cartController.clearCart(req, res));

  // Order routes
  router.post('/orders', authMiddleware, (req, res) => orderController.create(req, res));
  router.get('/orders/my', authMiddleware, (req, res) => orderController.getMyOrders(req, res));
  router.get('/orders/:id', authMiddleware, (req, res) => orderController.getById(req, res));
  router.get('/orders', authMiddleware, adminMiddleware, (req, res) => 
    orderController.getAll(req, res));
  router.patch('/orders/:id/status', authMiddleware, adminMiddleware, (req, res) => 
    orderController.updateStatus(req, res));

  // Banner routes
  router.get('/banners', (req, res) => contentController.getBanners(req, res));
  router.post('/banners', authMiddleware, adminMiddleware, (req, res) => 
    contentController.createBanner(req, res));
  router.put('/banners/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.updateBanner(req, res));
  router.delete('/banners/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.deleteBanner(req, res));

  // Event routes
  router.get('/events', (req, res) => contentController.getEvents(req, res));
  router.get('/events/:id', (req, res) => contentController.getEventById(req, res));
  router.post('/events', authMiddleware, adminMiddleware, (req, res) => 
    contentController.createEvent(req, res));
  router.put('/events/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.updateEvent(req, res));
  router.delete('/events/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.deleteEvent(req, res));

  // Experiment routes
  router.get('/experiments', (req, res) => contentController.getExperiments(req, res));
  router.get('/experiments/:id', (req, res) => contentController.getExperimentById(req, res));
  router.post('/experiments', authMiddleware, adminMiddleware, (req, res) => 
    contentController.createExperiment(req, res));
  router.put('/experiments/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.updateExperiment(req, res));
  router.delete('/experiments/:id', authMiddleware, adminMiddleware, (req, res) => 
    contentController.deleteExperiment(req, res));

  // Company info routes
  router.get('/company-info', (req, res) => contentController.getCompanyInfo(req, res));
  router.put('/company-info', authMiddleware, adminMiddleware, (req, res) => 
    contentController.updateCompanyInfo(req, res));

  // Upload routes
  router.post('/upload', authMiddleware, adminMiddleware, 
    uploadController.uploadMiddleware, 
    (req, res) => uploadController.uploadImage(req, res));
  router.post('/upload/multiple', authMiddleware, adminMiddleware,
    uploadMultiple,
    (req, res) => uploadController.uploadMultipleImages(req, res));

  // Mount router
  app.use('/api', router);
}

module.exports = { setupRoutes };
