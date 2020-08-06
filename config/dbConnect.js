var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sang1999:sang1999@cluster0-doobc.mongodb.net/project2?retryWrites=true&w=majority', {useNewUrlParser: true ,useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("ket loi db thanh cong");
});
module.exports = mongoose;