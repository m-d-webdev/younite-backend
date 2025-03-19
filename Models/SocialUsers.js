// ----- THIS IS CALLED MODEL < THIS IS WHERE WE CAN ADD USER IF THERE INFRMATIONS RESOECT THE SCHEMA BELLOW 


// 1 =>  After require the mongose package => create a Schema by => mongoose.Schema ({ [ALL FIELD AND THERE TYOE ] } ,{ INCLUDE THE CREATAT <AND THE UPDATE ATT FIELDs }) THEN EXPORT THE MODEL BY => model.exports = mongoose.Model("MODEL_NAME"  , SCHEMA_THAT_CREATED_BEFORE );
const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    
    FirstName: {
        type: String, required: true
    },


    LastName: {
        type: String, required: true
    },
    
    email: {
        type: String,
        required: true,
        unique: true
    },
    

    profile_img: {
        type: String, required: false, default: 'https://i.pinimg.com/736x/3c/83/46/3c834685fe96601cc3a6c45f7a48b356.jpg'
    },

    bio: {
        type: String,
        required: false
    },
    

}, { timestamps: true })




module.exports = mongoose.model("SocialUsers", UserSchema);