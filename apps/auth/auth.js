const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const token = jwt.sign({ foo: 'bar' }, 'shhhhh');

const usersDB = {};
const emails = [];
const SALT_ROUNDS = 10;
const errmsg = { error: { message: "Not logged in" } };
function checkAlphaNumeric(str, i = 0) {
  if (i === str.length) {
    return true;
  }
  let code = str.charCodeAt(i);
  if (
    !(code > 47 && code < 58) && // numeric (0-9)
    !(code > 64 && code < 91) && // upper alpha (A-Z)
    !(code > 96 && code < 123)
  ) {
    // lower alpha (a-z)
    return false;
  }
  return checkAlphaNumeric(str, i + 1);
}
router.route("/api/users").post((req, res) => {
  let user = req.body;
  let password = user.password;
  if (!password || password.length < 5) {
    console.log("Error: Invalid Password");
    return res.status(400).send("Error: Invalid Password");
  }
  let username = user.username;
  if (!checkAlphaNumeric(username) || Object.keys(usersDB).includes(username)) {
    console.log("Old username");
    console.log(usersDB);
    return res.status(400).send("Error: Invalid Username");
  }
  let email = user.email;
  if (!email.includes("@") || emails.includes(email)) {
    console.log("Email error");
    return res.status(400).send("Error: Invalid Email or Email already used");
  }
  let userInfo = (usersDB[username] = {});
  userInfo["email"] = email;
  userInfo["username"] = username;
  if (user.name) {
    userInfo["name"] = user.name;
  }
  emails.push(email);
  bcrypt.hash(password, SALT_ROUNDS, (err, hashPw) => {
    // hashPw will be the encrypted password
    if (err) {
      console.log(err);
      return res.send("error:message:{'Error converting to password'}");
    }
    userInfo["password"] = hashPw;
    let jwToken = jwt.sign({ username: username }, "secret password");
    //res.status(200);
    console.log(usersDB);
    res.send(
      JSON.stringify({
        username: username,
        jwt: jwToken,
      })
    );
  });
});

router.route("/api/sessions").post((req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let hashPw = usersDB[username]["password"];
  if (!password) {
    res.send("Error!");
  }
  bcrypt.compare(password, hashPw, (err, result) => {
    // if passwords matches, result will be truthy
    if (err) {
      console.log(err);
      return res.send({ error: { message: "Invalid password" } });
    }
    if (result) {
      let jwToken = jwt.sign({ username: username }, "secret password");
      return res.status(200).send(
        JSON.stringify({
          username: username,
          jwt: jwToken,
        })
      );
    }
    return res.send({ error: { message: "Invalid token" } });
  });
});

router.route("/api/sessions").get((req, res) => {
  let token = req.get("Authorization").split(" ")[1];
  console.log(token);
  let decodedToken = jwt.decode(token);
  if (decodedToken) {
    let username = decodedToken.username;
    let user = usersDB[username];
    console.log(user);
    delete user.password;
    return res.send(JSON.stringify(user));
  }
  return res.status(404).send(JSON.stringify(errmsg));
});

router.route("")
module.exports = router