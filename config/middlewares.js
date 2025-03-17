const jwt = require("jsonwebtoken")


const auth_token = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization.replace("Bearer ", "");
    if (!token) return res.status(400).json({ message: "No authorization matched on the request" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "invalid token " })
        } else {
            req.body.userId = decoded.userId
            next();
        }
    })

}

const guest = async (req, res, next) => {

    const authorization = req.headers.authorization;
    if (!authorization) return next();
    const token = authorization.replace("Bearer ", "");
    if (!token) return next();

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next();
        } else {
            return res.redirect('http://localhost:3000/');
        }
    })
}

module.exports = { auth_token, guest };

