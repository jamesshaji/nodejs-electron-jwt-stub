var express = require('express');
var router = express.Router();

const users = require('../controllers/user.controller');
const resource = require('../controllers/resources.controller');
const {verify} = require('../middleware/middleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/addUser', users.addUser);
router.post('/login', users.login);
router.get('/logout', users.logout);

router.get('/all', resource.allAccess);
router.get('/user', verify, resource.userBoard);

module.exports = router;
