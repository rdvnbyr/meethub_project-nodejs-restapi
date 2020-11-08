const router = require('express').Router();
const subscribeController = require('../controllers/subscribe');
const { body } = require('express-validator');

router.post(
    "/contact",
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email'),
        body('firstName').not().isEmpty(),
        body('lastName').not().isEmpty(),
        body('message').not().isEmpty()
    ],
     subscribeController.contactUs
);

module.exports = router;