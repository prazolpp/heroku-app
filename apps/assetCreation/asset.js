const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.route("/userUploads/:filename").get((req, res) => {
  fs.readFile(
    path.join(__dirname, "/../../public/assets", req.params.filename),
    "utf-8",
    (err, data) => {
      if (err) return console.log(err);
      res.set({
        "content-type": "text/html",
      });
      res.send(data);
    }
  );
});

router.route("/simple").get((req, res) => {
  fs.readFile(path.join(__dirname, "asset.html"), "utf-8", (err, data) => {
    if (err) return console.log(err);
    res.set({
      "content-type": "text/html",
    });
    res.send(data);
  });
});

router.route("/api/files").post((req, res) => {
  let filename = req.body.name;
  let content = req.body.content;
  fs.writeFile(path.join(__dirname, "/../../public/assets", filename), content, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("Created file " + filename);
  });
  res.status(200).send("good to go!");
});

router.route("/api/files/:filename").get((req, res) => {
  let filename = req.params.filename;
  if (filename) {
    fs.readFile(
      path.join(__dirname, "/../../public/assets", filename),
      "utf-8",
      (err, data) => {
        if (err) return console.log(err);
        return res.json({
          name: filename,
          content: data,
        });
      }
    );
  }
});

router.route("/api/files").get((req, res) => {
  let filesDir = __dirname + "/../../public/assets";
  console.log(filesDir);
  fs.readdir(path.join(__dirname, "/../../public/assets"), (err, files) => {
    files.forEach((file, i) => {
        console.log(file);
      fs.stat(path.join(filesDir, file), (err, stat) => {
        if (err) {
          console.log(err);
        }
        let now = Date.now();
        let endTime = new Date(stat.ctime).getTime() + 300000;
        if (now >= endTime) {
          fs.unlink(path.join(filesDir, file), (err) => {
            if (err) return console.log(err);
            else {
              console.log(file + "is deleted!");
            }
          });
        }
      });
    });
    return res.json(files);
  });
});

router.route("")
module.exports = router