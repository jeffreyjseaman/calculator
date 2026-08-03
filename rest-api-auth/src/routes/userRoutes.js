const express = require('express');

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Example of a protected, role-restricted resource: only authenticated
// admins may list all registered users.
router.get('/', authenticate, authorize('admin'), userController.listUsers);

module.exports = router;
