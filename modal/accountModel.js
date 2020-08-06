var mongoose = require('../config/dbConnect');
var bookModal = require("./bookModel");
var Schema = mongoose.Schema;
var accoutSchema = new Schema({
    username : String,
    password : String,
    email: String,
    role: String,
    bookId:[{
        type:String,
        ref: "book"
    }]
},{
collection : "user"
});
var AccoutModel = mongoose.model("user",accoutSchema);
function updateBookId(idUser,idBook){
    console.log(typeof idBook);
    return AccoutModel.updateOne({
        _id :idUser
    },{
        $push : {bookId :[idBook]}
    })
}

function getAll(){
    return AccoutModel.find().populate("bookId");
}

function findLogin(username){
    return AccoutModel.find({
        username : username,
    })
}
function createAccount(accout){
    return AccoutModel.create({
        username : accout.username,
        password : accout.password,
        email : accout.email,
        role : accout.role
    })
}
function deleteBookId(idUser,idBook){
    return AccoutModel.updateOne({
        _id :idUser
    },{
        $pull : {bookId :idBook}
    })
}
function findById(id){
    return AccoutModel.findOne({
        _id:id
    })
}
function findManager(){
    return AccoutModel.find({
        role:"manager"
    })
}
function findRole(role){
    return AccoutModel.find({
        role:role
    })
}
function findIdBook(idUser){
    return AccoutModel.findOne({_id:idUser}).populate('bookId');
}
function deleteUser(id){
return AccoutModel.deleteOne({_id:id});
}
function updateUser(id,username,email){
    return AccoutModel.updateOne({_id:id},{username:username,email:email});
}
function checkBook(idBook){
    return AccoutModel.find({
        bookId : { $in: idBook }
    })
}

module.exports= {
    findLogin,
    createAccount,
    updateBookId,
    deleteBookId,
    getAll,
    findById,
    findManager,
    findRole,
    findIdBook,
    deleteUser,
    updateUser,
    checkBook
};