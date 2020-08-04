var mongoose = require('../config/dbConnect');
var Schema = mongoose.Schema;
var bookSchema = new Schema({
    name : String
},{
collection : "book"
});
var bookModel = mongoose.model("book",bookSchema);
function addBook(name){
  return  bookModel.create({
    name : name
})
}
function findBook(name){
    return bookModel.findOne({
        name: name
    })
}
function deleteBook(id){
    return bookModel.deleteOne({
        _id : id
    })
}
function updateBook(id,name){
    return bookModel.updateOne({_id:id},{name:name});
}
module.exports = {
    addBook,
    findBook,
    deleteBook,
    updateBook
};