const router = require('express').Router();
const multer = require('multer');
const os = require('os');
const productController = require('../app/controllers/productController');
const { police_check } = require('../app/middleware/checkAuth');

router.get('/product', productController.index);

router.post('/product',
    multer({ dest: os.tmpdir() }).single('image'),
    police_check('create', 'Product'),
    productController.store);

router.put('/product/:id',
    multer({ dest: os.tmpdir() }).single('image'),
    productController.update);

router.put('/product/keluar/qty/:id', productController.updateQtyKeluar);
router.put('/product/masuk/qty/:id', productController.updateQtyMasuk);

router.delete('/product/:id', productController.destroy);

module.exports = router;