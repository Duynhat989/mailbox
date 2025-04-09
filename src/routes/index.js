// routes/index.js
const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const mailboxController = require('../controllers/mailboxController');
const messageController = require('../controllers/messageController');
const aliasController = require('../controllers/aliasController');
const { ROLES } = require('../models/userModel.js'); // Adjust the path as necessary
// const { authMiddleware } = require('../middlewares/auth');
const auth = require('../middlewares/authMiddleware');

// Domain routes
router.post('/domains', domainController.addDomain);
router.get('/domains', domainController.getDomains);
router.get('/domains/:id', domainController.getDomainDetails);
router.delete('/domains/:id', domainController.deleteDomain);
router.put('/domains/:id/primary', domainController.setPrimaryDomain);
router.get('/:id/dns-export', domainController.exportDNSConfig);


// Mailbox routes
router.post('/mailboxes',auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]), mailboxController.createMailbox);
router.get('/mailboxes', mailboxController.getAllMailboxes);
router.get('/domains/:domain_id/mailboxes', mailboxController.getDomainMailboxes);
router.put('/mailboxes/:id', mailboxController.updateMailbox);
router.delete('/mailboxes/:id', mailboxController.deleteMailbox);
router.post('/mailboxes/authenticate', mailboxController.authenticateMailbox);
// Lấy danh sahs email của user
router.get('/mailboxes/user',auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]), mailboxController.getMailboxUser);
router.get('/mailboxes/:id',auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]), mailboxController.getMailbox);

router.get('/message/:mailboxId',auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]), messageController.getMessageAll);
router.get('/message/detail/:messageId', messageController.getMessage);
router.get('/message/read/:messageId', messageController.readMessage);


// Alias routes
router.post('/aliases', aliasController.createAlias);
router.get('/aliases', aliasController.getAllAliases);
router.get('/aliases/:id', aliasController.getAlias);
router.get('/domains/:domain_id/aliases', aliasController.getDomainAliases);
router.put('/aliases/:id', aliasController.updateAlias);
router.delete('/aliases/:id', aliasController.deleteAlias);

module.exports = router;