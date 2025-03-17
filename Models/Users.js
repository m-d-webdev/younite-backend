// ----- THIS IS CALLED MODEL < THIS IS WHERE WE CAN ADD USER IF THERE INFRMATIONS RESOECT THE SCHEMA BELLOW 


// 1 =>  After require the mongose package => create a Schema by => mongoose.Schema ({ [ALL FIELD AND THERE TYOE ] } ,{ INCLUDE THE CREATAT <AND THE UPDATE ATT FIELDs }) THEN EXPORT THE MODEL BY => model.exports = mongoose.Model("MODEL_NAME"  , SCHEMA_THAT_CREATED_BEFORE );
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')


const LinksSchema = mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})
const UserSchema = new mongoose.Schema({
    FirstName: {
        type: String, required: true
    },
    LastName: {
        type: String, required: true
    },

    BirthDay: {
        type: String, required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String, required: true
    },

    profile_img: {
        type: String, required: false, default: 'https://i.pinimg.com/736x/3c/83/46/3c834685fe96601cc3a6c45f7a48b356.jpg'
    },

    bio: {
        type: String,
        required: false
    },
    links: [LinksSchema],   

}, { timestamps: true })



UserSchema.pre("save", async function (next) {
    try {
        if (!this.isModified('password')) return next();
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt)
        return next();
    } catch (error) {
        console.log(error);
    }
})


module.exports = mongoose.model("users", UserSchema);