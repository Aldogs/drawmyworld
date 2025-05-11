const express = require('express');
const router = express.Router();
const { uploadDrawing } = require('../controllers/uploadController');

router.post('/', uploadDrawing);

module.exports = router;