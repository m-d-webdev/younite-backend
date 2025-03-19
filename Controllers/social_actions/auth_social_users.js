const SocialUserModel = require("../../Models/Users")
const jwt = require('jsonwebtoken')
const Follow = require('../../Models/Follow');




const FRONTEND_URL = process.env.FRONTEND_URL


const Login_socila_user = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await SocialUserModel.findOne({ email })
        
        if (!user) {
            return res.status(404).json({ error: "email not found", error_code: "email_not_found" })
        }    
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        return res.status(200).json({ ok: true, url: `${FRONTEND_URL}/?_access_token=${token}` });


    } catch (error) {
        console.log(error);
        return res.status(500).send("failed =>  " + error)

    }
}


const Store_socila_NewUser = async (req, res) => {
    try {

        const { FirstName, LastName, email, profile_img } = req.body
        
        const check_user = await SocialUserModel.findOne({ email })
        if (!check_user) {
            let user = await SocialUserModel.create({ FirstName, LastName, profile_img, email })
            await Follow.create({ user_id: user._id });
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
            return res.status(200).json({ ok: true, url: `${FRONTEND_URL}/?_access_token=${token}` });
        } else {
            return res.status(401).json({ error: "email already taken", error_code: "email_already_taken" })
        }

    } catch (error) {
        console.log(error);

        return res.status(500).send("failed =>  " + error)
    }
}

module.exports = {
    Login_socila_user,
    Store_socila_NewUser
}