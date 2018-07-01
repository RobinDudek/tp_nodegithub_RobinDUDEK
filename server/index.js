const path = require("path");
const express = require("express");
const http = require("http");
const Redis = require("redis");

const PUBLIC_FOLDER = path.join(__dirname, "../public");
//const PORT = process.env.PORT || 5000;
const PORT = 5000;
//const REDIS_PORT = process.env.REDIS_PORT || 6367;
const REDIS_HOST = '127.0.0.1';
const REDIS_PORT = 6379;

const CallApi = require('./CallApi');
const githubApi = new CallApi();


const app = express();
const redisclient = Redis.createClient(REDIS_PORT, REDIS_HOST);
const server = http.createServer(app);

console.log("hello");
// Assign a random channel to people opening the application
app.get("/", (req, res) => {
  console.log("route /");
  res.sendFile(path.join(PUBLIC_FOLDER, "index.html"));
});

app.get("/repos", (req, res) => {
  console.log("route /repos");
  redisclient.get(repos, function(error, result){
    //si j'ai des données en cache sur la clé repos
    if (err) throw err;
    if(result !== null) {
      //Je renvoi direct le résultat
      res.send(repos);
    } else {
      try {
        //sinon j'appelle l'Api de Github
        var json = githubApi.getAllRepos();
        //on met en cache pendant une heure => 3600 secondes
        redisclient.setex(repos, 3600, JSON.stringify(json));
        //et j'envoie le résultat
        res.send(json);
      } catch(error) {
        console.log(error);
      }
    }
  });
});

app.use(express.static(PUBLIC_FOLDER));

server.listen(PORT, () => {
    console.log(`Server started on port ${server.address().port}`);
});
