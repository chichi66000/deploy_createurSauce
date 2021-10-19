const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controller/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer_config')

// enregistrer nouvelle sauce
router.post('/',auth,multer.single('image'), sauceCtrl.createSauce );
// liked ou disliked une sauce
router.post('/:id/like',auth, sauceCtrl.likeSauce);
// modifier une sauce
router.put('/:id',auth, multer.single('image'), sauceCtrl.modifySauce);
// récupérer tous les sauces 
router.get('/',auth, sauceCtrl.getAllSauces);
// récupérer une sauce particulière
router.get('/:id',auth, sauceCtrl.getOneSauce);
//supprimer une sauce avec id fourni
router.delete('/:id',auth, sauceCtrl.deleteSauce);

module.exports = router;