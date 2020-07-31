var mongoose = require('../config/dbConnect');
var bookModal = require("./bookModal");
var Schema = mongoose.Schema;
var accoutSchema = new Schema({
    username : String,
    password : String,
    role: String,
    bookId:[{
        type:String,
        ref: "book"
    }]
},{
collection : "user"
});
var AccoutModel = mongoose.model("user",accoutSchema);

// AccoutModel.updateOne({
//     _id :"5f239de5120b014494bbc72b"
// },{
//     $push : {bookId :["5f238c7b350ba80b286ef84b"]}
// }).then(data=>{
//     console.log(data);
// }).catch(err=>{
//     console.log(err);
// })

AccoutModel.findOne({
    _id:"5f239de5120b014494bbc72b"
})
.populate("bookId")
.then(data=>{
    console.log(data);
})
module.exports= AccoutModel;