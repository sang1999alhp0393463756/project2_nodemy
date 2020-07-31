var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/project_2', {useNewUrlParser: true ,useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("ket loi db thanh cong");
});
module.exports = mongoose;