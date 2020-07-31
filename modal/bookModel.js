var mongoose = require('../config/dbConnect');
var Schema = mongoose.Schema;
var bookSchema = new Schema({
    name : String
},{
collection : "book"
});
var bookModel = mongoose.model("book",bookSchema);
module.exports = bookModel;