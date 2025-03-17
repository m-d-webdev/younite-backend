const m = require('mongoose')



const connect_to_db = async () => {
    try {
        const mongodbUrl = process.env.MONGO_DB_URL;
        await m.connect(mongodbUrl);
        console.log("-------------------------------------------- ");
        console.log("connected successfully to database ");
        console.log("-------------------------------------------- ");

    } catch (error) {

        console.log("-------------------------------------------- ");
        console.log('Failed to connect to database for => ', error);
        console.log("-------------------------------------------- ");
        process.exit(1)

    }
}


module.exports = connect_to_db;