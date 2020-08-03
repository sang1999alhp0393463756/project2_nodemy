var router = require('express').Router();
var fs = require('fs');
var accout = require('../modal/accountModel');
var jwt = require('jsonwebtoken');
var path = require('path');

router.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,"../views/Login_v5/Login_v5/index.html"));
});
router.post("/", function (req, res, next) {
    var privateKey = fs.readFileSync('./key/primarykey.pem');
    var username = req.body.username;
    var password = req.body.password;
    accout.findOne({
        username,
        password
    }).then(data => {
        if (data) {
            var token = jwt.sign({ id: data._id }, privateKey, { algorithm: "RS256" });
            res.cookie('token', token, { maxAge: 60 * 60 * 1000 * 2 * 24 });
            res.token = token;
            next();
        } else {
            return res.json({
                error: false,
                messager: "tai khoan khong chinh xac"
            });
        }
    })
}, (req, res) => {
    return res.json({
        error: true,
        data: res.token
    });
});
var checklogin = (req, res, next) => {
    var publichKey = fs.readFileSync('./key/publickey.crt');
    try {
        var token = req.cookies.token;
        var id = jwt.verify(token, publichKey, { algorithm: "RS256" });
        accout.findOne({
            _id: id.id
        }).then(data => {
            if (data) {
                res.user = data;
                next();
            } else {
                console.log("dang nhap that bai");
            }
        })
    } catch (err) {
        res.json("dang nhap that bai");
    };
}
var checkManager = (req, res, next) => {
    accout.findOne({
        role: res.user.role
    }).then(data => {
        if (data.role == "manager" || data.role == "admin") {
            next();
        } else {
            res.json("ko co quyen");
        }
    }).catch(err => {
        console.log(err);
    })
};

var checkAdmin = (req, res, next) => {
    accout.findOne({
        role: res.user.role
    }).then(data => {
        if (data.role == "admin") {
            next();
        } else {
            res.json("ko co quyen");
        }
    }).catch(err => {
        console.log(err);
    })
};



router.get('/manager', checklogin, checkManager, (req, res) => {
    res.json("welcome teacher");
});
router.get('/admin', checklogin, checkAdmin, (req, res) => {
    res.json("welcome manager");
});

module.exports = router;