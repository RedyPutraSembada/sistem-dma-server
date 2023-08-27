const router = require('express').Router();
const multer = require('multer');
const os = require('os');
const productController = require('../app/controllers/productController');
const { police_check } = require('../app/middleware/checkAuth');

router.get('/product', police_check('index', 'Product'), productController.index);

router.post('/product',
    multer({ dest: os.tmpdir() }).single('image'),
    police_check('create', 'Product'),
    productController.store);

router.put('/product/:id',
    multer({ dest: os.tmpdir() }).single('image'),
    police_check('update', 'Product'),
    productController.update);

router.put('/product/keluar/qty/:id', police_check('update-qty-keluar', 'Product'), productController.updateQtyKeluar);
router.put('/product/masuk/qty/:id', police_check('update-qty-masuk', 'Product'), productController.updateQtyMasuk);

router.delete('/product/:id', police_check('delete', 'Product'), productController.destroy);

module.exports = router;