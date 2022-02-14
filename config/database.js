const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

exports.connect = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(()=>{
        console.log("successfully connected to db");
    }).catch((e)=>{
        console.log("Failed to connect to db",e);
        process.exit(1);
    })
}