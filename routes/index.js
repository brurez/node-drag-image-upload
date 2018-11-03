const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function(req, res) {
  res.send(JSON.stringify(req.files));
});

module.exports = router;
