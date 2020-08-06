var router = require('express').Router();
var fs = require('fs');
var bcrypt = require('bcrypt');
var accout = require('../modal/accountModel');
var book = require('../modal/bookModel');
var jwt = require('jsonwebtoken');
var path = require('path');
var cookieParser = require('cookie-parser');
const { route } = require('./users');
router.post('/sign-up', function (req, res, next) {
    accout.findLogin(req.body.username).then(data => {
        if (data.length == 0) {
            next();
        } else {
            return res.json({
                error: false
            });
        }
    });
}, function (req, res) {
    var obj = {};
    if (req.body.username) obj.username = req.body.username;
    if (req.body.email) obj.email = req.body.email;
    obj.role = "manager";
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
            obj.password = hash;
            accout.createAccount(obj).then(data => {
                var primaryKey = fs.readFileSync('./key/primarykey.pem');
                var token = jwt.sign({ id: data._id }, primaryKey, { algorithm: "RS256" });
                res.cookie("token",token,{maxAge:60*60*1000*24});
                res.json({
                    error: true,
                });
            });
        });
    });
});
router.get('/dangki', (req, res) => {
    res.sendFile(path.join(__dirname, "../views/sign-up.html"));
});
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "../views/login.html"));
});
router.post('/sign-in', function (req, res, next) {
    accout.findLogin(req.body.username).then(data => {
        if (data.length != 0) {
            res.user = data;
            next();
        } else {
            res.json({
                error: false,
                messager: "tai khoan hoac mat khau khong chinh xac"
            });
        }
    })
}, function (req, res) {
    var obj = {
        username: req.body.username,
        password: req.body.password
    }
    bcrypt.compare(obj.password, res.user[0].password, function (err, value) {
        if (value) {
            var primaryKey = fs.readFileSync('./key/primarykey.pem');
            var token = jwt.sign({ id: res.user[0]._id }, primaryKey, { algorithm: "RS256" });
            res.json({
                error: true,
                messager: "dang nhap thanh cong",
                data: token
            })
        } else {
            res.json({
                error: false,
                messager: "tai khoan hoac mat khau khong chinh xac"
            });
        }
    });
})
var checklogin = (req, res, next) => {
    var publichKey = fs.readFileSync('./key/publickey.crt');
    try {
        var token = req.cookies.token;
        var id = jwt.verify(token, publichKey, { algorithm: "RS256" });
        accout.findById(id.id).then(data => {
            if (data) {
                res.user = data;
                next();
            } else {
                return res.redirect("/login");
            }
        })
    } catch (err) {
        return res.redirect("/login");
    };
}



var checkAdmin = (req, res, next) => {
    if (res.user.role == "admin") {
        next();
    } else {
        return res.redirect("/login");
    }
};

router.get('/admin', checklogin, checkAdmin, async (req, res) => {
    var listManager = await accout.findManager();
    res.render('../views/admin.ejs', { listManager: listManager });
});
router.post('/addBook', async function (req, res, next) {
    var nameBook = req.body.nameBook;
    res.name = nameBook;
    var data1 = await book.findBook(nameBook);
    if (data1) {
        return res.json({
            error: false,
            messager: "book already exist"
        })
    }
    await book.addBook(nameBook);
    next();
}, async (req, res) => {
    var data = await book.findBook(res.name);
    var publichKey = fs.readFileSync('./key/publickey.crt');
    var token = req.cookies.token;
    var id = jwt.verify(token, publichKey, { algorithm: "RS256" });
    console.log(id);
    accout.updateBookId(id.id, data._id.toString()).then(resutl => {
        return res.json({
            error: true,
            messager: "add book successfull"
        })
    })
});

router.delete('/delBook', async function (req, res, next) {
    var idBook = req.body.idBook;
    var data = await book.deleteBook(idBook);
    res.idBook = idBook;
    next();
}, (req, res) => {
    var publichKey = fs.readFileSync('./key/publickey.crt');
    var token = req.cookies.token;
    var id = jwt.verify(token, publichKey, { algorithm: "RS256" });
    accout.deleteBookId(id.id, res.idBook.toString()).then(resutl => {
        return res.json({
            error: true,
            messager: "delete book successfull",
            data: resutl
        })
    })
});
router.get('/list', async (req, res, next) => {
    var array = await accout.getAll();
    var publichKey = fs.readFileSync('./key/publickey.crt');
    var user;
    try {
        var token = req.cookies.token;
        var id = jwt.verify(token, publichKey, { algorithm: "RS256" });
        user = await accout.findById(id.id);
    } catch (err) {
        user = null;
    }
    res.render('index', { list: array, user: user });
})
router.put('/', async function (req, res, next) {
    var nameBook = req.body.nameBook;
    var result = await book.findBook(nameBook);
    if (result) {
        return res.json({
            error: false
        });
    } else {
        res.nameBook = nameBook;
        next();
    }
}, async (req,res,next)=>{
    var id = req.body.idBook;
    var data = await accout.checkBook(id);
    if(data.length==0){
        res.idbook = id;
        next();
    }else{
        return res.json({
            error: false
        });
    }

}, (req, res) => {
    book.updateBook(res.idbook, res.nameBook).then(data => {
        return res.json({
            error: true
        });
    })
});
router.delete('/delUser', async (req, res, next) => {
    var idUser = req.body.idUser;
    res.idUser = idUser;
    var data = await accout.findIdBook(idUser);
    if (data.bookId.length == 0) {
        next();
    } else {
        for (var i = 0; i < data.bookId.length; i++) {
            await book.deleteBook(data.bookId[i]._id);
        }
        next();
    }

}, (req, res) => {
    accout.deleteUser(res.idUser).then(data => {
        res.json(data);
    })
});
router.put('/updateUser',async(req,res,next)=>{
    var username = req.body.username;
    res.username = username;
    var data = await accout.findLogin(username);
    console.log(data);
    if(data.length!=0){
        console.log(data);
        return res.json({
            error : false
        });
    }else{
        console.log("a");
        next();
    }
},(req,res)=>{
    accout.updateUser(req.body.id,res.username,req.body.email).then(data=>{
        res.json({
            error:true
        })
    })
});
module.exports = router;