const router = require('express').Router();
const barangKeluarController = require('../app/controllers/barangKeluarController');

router.get('/barangKeluar', barangKeluarController.index);

module.exports = router;
