const router = require('express').Router();
const BarangMasukController = require('../app/controllers/barangMasukController');

router.get('/barangMasuk', BarangMasukController.index);

module.exports = router;