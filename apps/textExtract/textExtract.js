const Tesseract = require('tesseract.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// You must specify a folder where files should get uploaded to
// Tip: If you specify the same folder as express.static middleware
//    then every file you upload will be available on the website
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/files/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
   
const upload = multer({ storage: storage })
const returnedJobs = {};
const runTesseract = (files, currTime) => {
    files.forEach((file,i) => {
        let filename = file.filename;
        let returnedObj = { url: `/../files/${filename}` };
        Tesseract.recognize(
            path.join(__dirname, '../../public', 'files', filename),
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data : { text }}) => {
            if(text){
                returnedObj['text'] = text;
                returnedObj['status'] = "complete";
            }
        })
        returnedObj['status'] = 'processing';
        returnedJobs[currTime].push(returnedObj);
    })
}

router.post('/api/assets', upload.array('assets[]'), (req, res) => {
    let files = req.files;
    console.log(files);
    let currTime = Date.now();
    returnedJobs[currTime] = [];
    runTesseract(files, currTime);
    res.header('content-type', 'application/json');
    res.send({url: `/imageAnalysis/jobs/${currTime}`});
})
router.route(`/api/jobs/:jobid`).get((req, res) => {
    let jobId = req.params.jobid;
    console.log(jobId);
    let returnArr = returnedJobs[jobId];
    res.header('content-type', 'application/json');
    res.send(returnArr);
})

router.route('').get((req, res) => {
    fs.readFile(path.join(__dirname, './tess.html'),'utf-8', (err, data) => {
        if(err) return err;
        res.set("content-type", "text/html");
        res.send(data);
    })
})
router.route('/jobs/:jobId').get((req, res) => {
    fs.readFile(path.join(__dirname, './job.html'),'utf-8', (err, data) => {
        if(err) return err;
        res.set("content-type", "text/html");
        res.send(data);
    })
})

router.route("")
module.exports = router