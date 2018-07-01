const path = require("path");
const express = require("express");
const http = require("http");
const redis = require("redis");

const PUBLIC_FOLDER = path.join(__dirname, "../public");
//const PORT = process.env.PORT || 5000;
const PORT = 5000;
//const REDIS_PORT = process.env.REDIS_PORT || 6367;
const REDIS_HOST =  process.env.REDIS_URL || '127.0.0.1';
const REDIS_PORT = 6379;

const CallApi = require('./CallApi');
const githubApi = new CallApi();


const app = express();
const redisclient = redis.createClient(process.env.REDIS_URL);
const server = http.createServer(app);

console.log("hello");
// Assign a random channel to people opening the application
app.get("/", (req, res) => {
  console.log("route /");
  res.sendFile(path.join(PUBLIC_FOLDER, "index.html"));
});

app.get("/repos", (req, res) => {
  console.log("route /repos");
  redisclient.get('repos', function(error, result){
    if (err) throw err;
      //si j'ai des données en cache sur la clé repos
    if(result !== null) {
      //Je renvoi direct le résultat
      console.log("repos en cache");
      res.send(result);
    } else {
      try {
        console.log("repos pas en cache");
        //sinon j'appelle l'Api de Github
        //on met en cache pendant une heure => 3600 secondes
        redisclient.set('repos', 3600, JSON.stringify(githubApi.getAllRepos()));
        //et j'envoie le résultat
        res.send(json);
      } catch(error) {
        console.log(error);
      }
    }
  });
});

redisclient.on('connect', function() {
    console.log('redis connected');
});

redisclient.on('error', err => {
  // handle the err here or just ignore them
  console.log(err);
});

console.log("on affiche le public folder");
app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server started on port ${server.address().port}`);
});
