const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const gm = require('gm').subClass({imageMagick: true});

router.use('/*',(req, res, next) => {
    let authorization = req.get("Authorization");
    fetch(req.protocol+"://"+req.headers.host+"/auth/api/sessions", {
        headers:{
            Authorization: authorization
        }
    }).then((r) =>  r.json()).then((body) => {
        req.user = body;
        next()
    })
})
router.route('/images').get((req, res) => {
    console.log('here');
    fs.readdir(path.resolve(__dirname,'/../../public/images'), (err, files) => {
        res.set({'content-type': 'application/json'})
        res.send(files)
    })
})
router.route('/:name?').get((req, res) => {
    fs.readFile(path.join(__dirname, 'memechat.html'), 'utf-8', (err, data) => {
        if(err){
            return console.log(err);
        }
        res.set({
            "content-type":"text/html"
        })
        return res.send(data);
    });
});
router.route("/api/session").get((req, res) => {
    let error = req.user.error;
    console.log(error);
    let user = req.user;
    console.log(user);
    if (error) {
      return res.status(403).send(JSON.stringify(error));
    }
    if (user.username) {
      console.log(user.username);
      return res.send(JSON.stringify(user));
    }
});
router.route('/images').post((req, res) => {
    const imageData = Buffer.from(req.body.img, 'base64');
    gm(imageData).fontSize(70).stroke('#ffffff').drawText(0, 200, req.body.text)
    .write(path.resolve(__dirname,'/../../public/images', `${req.user.username}.png`), (err,data) => {
        if(err) console.log(err);
    });
    console.log(__dirname+'/../../public/images');
    console.log("image received!");
})

module.exports = router