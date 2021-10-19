const Sauce = require('../models/sauce');
const fs = require('fs');
require('../middleware/cloudinary');
const cloudinary = require('cloudinary')


exports.createSauce = async (req, res, next) => { 
    
    try {
        const result = await cloudinary.uploader.upload(req.file.path)
        // enregistrer nouvelle sauce avec imageUrl venant de Cloudinary
        const sauceObject = req.body;
        const sauce = new Sauce({
        ...sauceObject,
        imageUrl : result.secure_url,
        cloudinary_id: result.public_id,
        likes:0,
        dislikes:0, 
        usersLiked: [],
        usersDisliked: [],
        })
        sauce.save()
        .then(() => res.status(201).json({message: 'sauce crée!'}))
        .catch((err) => {
            res.status(400).json({err})
        } )
    }catch (err) { console.log(err); console.log("Clodinary false");}
    
};

// modifier une sauce
exports.modifySauce = async (req, res, next) => {
    // let sauceObject = {};
    // s'il y a image
    if (req.file) {
        console.log("il y a image");
        Sauce.findOne({_id: req.params.id})
        .then( sauce => {
            // delete image avec cloudinary
            cloudinary.uploader.destroy(sauce.cloudinary_id);
           // mettre à jour nouvelle photo
            cloudinary.uploader.upload(req.file.path).then (result => {
                console.log(result);
                // update la sauce
            Sauce.updateOne({_id: req.params.id},
                {...req.body,
                    imageUrl : result.secure_url,
                    cloudinary_id: result.public_id,
                    _id: req.params.id})
            .then(() => res.status(200).json({message: "sauce modifié avec image"}))
            .catch((error) => res.status(404).json({error}))
            })
        })
        .catch( err => {console.log(err);})
    }
    // update sans image
    else {
        console.log("update sans image");
        Sauce.updateOne({_id: req.params.id},
            {...req.body,
                _id: req.params.id})
        .then(() => res.status(200).json({message: "sauce modifié"}))
        .catch((error) => res.status(404).json({error}))
    }
   
};

// récupérer tous les sauces 
exports.getAllSauces =  (req, res) => {
    Sauce.find()
        .then( (sauces) => res.status(200).json(sauces))
        .catch(error =>  res.status(404).json({error}))
};

// récupérer une sauce particulière
exports.getOneSauce =  (req, res) => {
    Sauce.findOne({ _id: req.params.id})
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({error}))
};

//supprimer une sauce avec id fourni
exports.deleteSauce =  async(req, res) => {
    Sauce.findOne({_id: req.params.id })
        .then((sauce) => {
            // supprimer image avec cloudinary
            cloudinary.uploader.destroy(sauce.cloudinary_id)
            .then( () => {
                // puis supprimer la sauce
                Sauce.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message: 'Supprimé'}))
                .catch((error) => res.status(404).json({error}))
            })
        })
        .catch((error) => res.status(500).json({error}))  
};

// liked ou disliked une sauce
exports.likeSauce =  async (req, res, next) => {
    switch(req.body.like) {
        case 0: // annuler likes et disliked
            Sauce.findOne({_id: req.params.id})
                .then((sauce) => {
                    // si user a déjà likes la sauce
                    if(sauce.usersLiked.find((userId) => userId === req.body.userId)) {
                        Sauce.updateOne({_id: req.params.id}, {
                            $inc: {likes: -1}, //retirer 1 likes
                            $pull: {usersLiked: req.body.userId}, // retirer le userId dans array
                            _id:req.params.id,
                        } )
                            .then( () => res.status(200).json({message: "Votre avis a été pris en compte, 1 like delete"}))
                            .catch((error) => res.status(400).json({error}))
                    }

                    // si user a déjà dislikes la sauce
                    if(sauce.usersDisliked.find((userId) => userId === req.body.userId)) {
                        Sauce.updateOne({_id:req.params.id}, {
                            $inc: {dislikes: -1},
                            $pull: {usersDisliked: req.body.userId},
                            _id:req.params.id,
                        })
                            .then(() => res.status(200).json({message: 'Votra avis a été pris en compte, 1 dislike delete'}))
                            .catch((error)=> res.status(400).json({error}))
                    }
                })
                .catch((error) => res.status(400).json({error}))
            break;

        case 1: // ajouter 1 likes
            // chercher si jamais ce user a disliked cette sauce
            Sauce.findOne({_id: req.params.id}).then ( sauce => {
                if(sauce.usersDisliked.find((userId) => userId === req.body.userId)) {
                    // enlever ce dislike
                    Sauce.updateOne({_id:req.params.id}, {
                        $inc: {dislikes: -1},
                        $pull: {usersDisliked: req.body.userId},
                        _id:req.params.id,
                    })
                    .then ( () => {
                        //ajouter 1 like
                        Sauce.updateOne({_id:req.params.id}, {
                            $inc: {likes: 1}, // +1 likes
                            $push: {usersLiked: req.body.userId}, // ajouter userId dans array
                            _id:req.params.id,
                        })
                    })
                }
                else {
                   // puis ajouter ce like
                    Sauce.updateOne({_id:req.params.id}, {
                        $inc: {likes: 1}, // +1 likes
                        $push: {usersLiked: req.body.userId}, // ajouter userId dans array
                        _id:req.params.id,
                    })
                    .then(() => res.status(200).json({message: 'Votre avis a été pris en compte, 1 like ajouté'}))
                    .catch((error) => res.status(400).json({error}));  
                }
            })
            break;

        case -1: // ajouter dislikes
        // chercher dans les likes si trouver ce user
        Sauce.findOne({_id: req.params.id}).then ( sauce => {
            // si ce user a liké enlever ce like avant ajouter dislike
            if(sauce.usersLiked.find((userId) => userId === req.body.userId)) {
                // retirer le like
                Sauce.updateOne({_id: req.params.id}, {
                    $inc: {likes: -1}, //retirer 1 likes
                    $pull: {usersLiked: req.body.userId}, // retirer le userId dans array
                    _id:req.params.id,
                } )
                    .then ( () => {
                    // add 1 disliked
                    Sauce.updateOne({_id:req.params.id}, {
                        $inc: {dislikes: 1}, // +1 dislikes
                        $push: {usersDisliked: req.body.userId}, // ajouter userId dans array 
                        _id:req.params.id,
                        })
                        .then(() => res.status(200).json({message: 'Votre avis a été pris en compte'}))
                        .catch((error) => res.status(400).json({error})); 
                })
            
            }
            //sinon ajouter dislike 
            else {
                Sauce.updateOne({_id:req.params.id}, {
                $inc: {dislikes: 1}, // +1 dislikes
                $push: {usersDisliked: req.body.userId}, // ajouter userId dans array 
                _id:req.params.id,
                })
                .then(() => res.status(200).json({message: 'Votre avis a été pris en compte'}))
                .catch((error) => res.status(400).json({error})); 
            }
            
                
        })
            
        break;
        default:
            console.log(' Erreur, retentez plus tard');
    }
    
};
