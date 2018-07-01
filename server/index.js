const path = require("path");
const express = require("express");
const http = require("http");
const redis = require("redis");
const fetch = require("node-fetch");

const PUBLIC_FOLDER = path.join(__dirname, "../public");

var url = 'https://api.github.com';
const PORT = process.env.PORT || 5042;
//const REDIS_PORT = process.env.REDIS_PORT || 6367;
const REDIS_HOST =  process.env.REDIS_URL || '127.0.0.1';
const REDIS_PORT = 6379;

//const CallApi = require('./CallApi');
//const githubApi = new CallApi();


const app = express();
const redisclient = redis.createClient(process.env.REDIS_URL);
const server = http.createServer(app);

console.log("hello");
// Assign a random channel to people opening the application
app.get("/", (req, res) => {
  console.log("route /");
  redisclient.del('repos', function(err, reply) {
    console.log(reply);
});
  res.sendFile(path.join(PUBLIC_FOLDER, "index.html"));
});

app.get("/repos", (req, res) => {
  console.log("route /repos");
  redisclient.get('repos', function(error, result){
    if (error) console.log(error);
      //si j'ai des données en cache sur la clé repos
    if(result !== null) {
      //Je renvoi direct le résultat
      console.log("repos en cache");
      res.send(result);
    } else {
      try {
        console.log("repos pas en cache");
        fetch(url + '/search/repositories?q=stars:>=1000')
        .then(res => res.json())
        .then(json => {
          console.log("JSON:",  json);
          //on met en cache pendant une heure => 3600 secondes
          redisclient.set('repos', json);
          redisclient.expire('repos', 3600);
          //et j'envoie le résultat
          res.send(json);
        });
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
app.use('/', express.static(PUBLIC_FOLDER));

server.listen(PORT, () => {
    console.log(`Server started on port ${server.address().port}`);
});
