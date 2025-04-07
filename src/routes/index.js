// routes/index.js
const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const mailboxController = require('../controllers/mailboxController');
const aliasController = require('../controllers/aliasController');
// const { authMiddleware } = require('../middlewares/auth');

// Domain routes
router.post('/domains', domainController.addDomain);
router.get('/domains', domainController.getDomains);
router.get('/domains/:id', domainController.getDomainDetails);
router.delete('/domains/:id', domainController.deleteDomain);
router.put('/domains/:id/primary', domainController.setPrimaryDomain);
router.get('/:id/dns-export', domainController.exportDNSConfig);


// Mailbox routes
router.post('/mailboxes', mailboxController.createMailbox);
router.get('/mailboxes', mailboxController.getAllMailboxes);
router.get('/mailboxes/:id', mailboxController.getMailbox);
router.get('/domains/:domain_id/mailboxes', mailboxController.getDomainMailboxes);
router.put('/mailboxes/:id', mailboxController.updateMailbox);
router.delete('/mailboxes/:id', mailboxController.deleteMailbox);
router.post('/mailboxes/authenticate', mailboxController.authenticateMailbox);

// Alias routes
router.post('/aliases', aliasController.createAlias);
router.get('/aliases', aliasController.getAllAliases);
router.get('/aliases/:id', aliasController.getAlias);
router.get('/domains/:domain_id/aliases', aliasController.getDomainAliases);
router.put('/aliases/:id', aliasController.updateAlias);
router.delete('/aliases/:id', aliasController.deleteAlias);

module.exports = router;