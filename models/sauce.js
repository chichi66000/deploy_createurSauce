const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator')

const sauceSchema = mongoose.Schema({
    userId: {type:String, required:true},
    name: { type: String, required:true, unique: true},
    manufacturer: { type: String, required:true},
    description: { type: String, required:true},
    mainPepper: { type: String, required:true},
    imageUrl: { type: String, required:true},
    heat: { type: Number, required:true},
    likes: { type: Number, default:0, require:true},
    dislikes: { type: Number, default:0, require:true},
    usersLiked: { type: [String], require:true},
    usersDisliked: { type: [String], require:true},
    cloudinary_id: {type: String, required:true},
})

sauceSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('sauce', sauceSchema)