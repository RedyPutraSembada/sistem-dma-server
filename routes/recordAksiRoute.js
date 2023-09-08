const router = require('express').Router();
const recordAksiController = require('../app/controllers/recordAksiController');
const { police_check } = require('../app/middleware/checkAuth');

router.get('/record-aksi', police_check('index', 'RecordAksi'), recordAksiController.index);

module.exports = router;