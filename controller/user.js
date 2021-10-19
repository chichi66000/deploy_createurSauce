const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const {body, validationResult} = require('express-validator'); 


// créer une route pour enregistrer nouvel utilisateur
exports.signup = (
    body ('email', 'Email is not valid') // valider email et password avant créer nouvel user
        .isEmail()
        .bail()
        .normalizeEmail(),
    body('password', 'Password must be +8 characters long')
        .isLength({min: 8})
        .isUppercase({min:1})
        ,
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) { 
        return res.status(400).json({errors: errors.array()})
            }

        bcrypt.hash(req.body.password, 10) // fonction asynchrone qui renvoie une promise avec hash comme response
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash 
            });
            user.save()// une promise encore
                .then(() => res.status(201).json({ message: 'Utilisateur crée'}))
                .catch((error) => res.status(400).json({error}))
        })
        .catch((error) => res.status(500).json({error}))
})

// route pour authentifier utilisateur déjà existé dans base de donnée
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})// trouver utilisateur avec email unique
        .then( (user) => {
            if(!user) { // si user n'existe pas dans bdd
                return res.status(401).json({error: 'Utilisateur non trouvé'}) // renvoyer message erreur
            }
            bcrypt.compare(req.body.password, user.password) // si user est trouvé, comparer le mot de passe entrée avec celui dans bdd
                .then((valid) => {
                    if(!valid) {// si mdp n'est pas valid, renvoyer error
                        return res.status(401).json({ error: 'Mot de passe incorrect'})
                    }
                    res.status(200).json({ // si mdp correct, renvoyer id
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )// un token permet la connexion
                    })
                })
                .catch((error) => res.status(500).json({error}))
        })
        .catch((error) => res.status(500).json({error})) // erreur de serveur pour la requete
}