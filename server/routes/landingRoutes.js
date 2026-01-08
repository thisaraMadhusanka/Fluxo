const express = require('express');
const router = express.Router();
const { submitContact, subscribeNewsletter } = require('../controllers/landingController');

router.post('/contact', submitContact);
router.post('/subscribe', subscribeNewsletter);

module.exports = router;
