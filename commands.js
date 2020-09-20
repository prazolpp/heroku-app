const { exec } = require("child_process");
const express = require("express");
const router = express.Router();


router.route("/").get((req, res) => {
  res.send(`
    <div class="container">
    <h1>Commands</h1>
    <p>
      For the security of our server, only a few commands are allowed. Try some of
      these:
    </p>
    <p class="option">ls</p>
    <p class="option">git status</p>
    <p class="option">ls ~/</p>
    <p class="option">cat</p>
    <input class="inputComm" type="text" />
  </div>
  <hr />
  <pre class="output"></pre>
  
  <style>
    .option {
      cursor: pointer;
    }
  </style>
  
  <script>
    const inp = document.querySelector(".inputComm");
    inp.focus();
    const output = document.querySelector(".output");
  
    const renderCommand = () => {
      fetch("/commands/execute", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          command: inp.value,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          output.innerHTML = data.output;
        });
    };
  
    inp.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        renderCommand();
        inp.value = "";
      }
    });
  
    const allCommands = document.querySelectorAll(".option");
    allCommands.forEach((e) => {
      e.onclick = () => {
        inp.value = e.innerText;
        renderCommand();
        inp.value = "";
      };
    });
  </script>  
    `);
});

router.route("/execute").post((req, res) => {
  let inpCommand = req.body.command;
  let validCommands = ["ls", "pwd", "cat"];
  let invalidCommands = ["ls -la", "ls -a"];
  console.log(inpCommand);
  exec(inpCommand, (error, stdout, stderr) => {
    let firstCommand = inpCommand.split(" ")[0];

    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (!validCommands.includes(firstCommand) || invalidCommands.includes(inpCommand)) {
      let errorOutput = "invalid command. please only use ls, pwd or cat";
      console.log(errorOutput);
      res.send(
        JSON.stringify({
          output: errorOutput,
        })
      );
      return;
    }
    console.log(stdout);
    res.send(
      JSON.stringify({
        output: stdout,
      })
    );
  });
});

router.route('')
module.exports = router