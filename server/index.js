const path = require("path");
const express = require("express");
const http = require("http");
const redis = require("redis");
const fetch = require("node-fetch");

const PUBLIC_FOLDER = path.join(__dirname, "../public");

var url = 'https://api.github.com';
var CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const PORT = process.env.PORT || 5042;
const REDIS_HOST =  process.env.REDIS_URL || '127.0.0.1';

const app = express();
const redisclient = redis.createClient(process.env.REDIS_URL);
const server = http.createServer(app);

// Assign a random channel to people opening the application
app.get("/", (req, res) => {
  console.log("route /");
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
        //au début je voulais mettre la fonction dans une classe à part
        //mais la gestion du async await m'a fait perdre trop de temps
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

app.get("/login", (req, res) => {
  //J'ai jamais pu trouver/comprendre comment login un user via github
  //l'api est hyper mal conçu à ce niveau
  fetch('https://github.com/login/oauth/authorize?scope=user:email&client_id='+CLIENT_ID)
    .then(res => res.json())
    .then(json => {
      res.send(json);
    });
});

app.get("/star/:user/:repo", (req, res) => {

  var user = req.params.user;
  var repo = req.params.repo;
  fetch(url + '/user/starred/'+user+'/'+repo)
    .then(res => res.json())
    .then(json => {
      res.send(json);
    });
});

app.put("/star/:user/:repo", (req, res) => {
  var user = req.params.user;
  var repo = req.params.repo;
  fetch(url + '/user/starred/'+user+'/'+repo)
    .then(res => res.json())
    .then(json => {
      redis.del('repos');
      res.send(json);
    });
});

app.delete("/star/:user/:repo", (req, res) => {
  var user = req.params.user;
  var repo = req.params.repo;
  fetch(url + '/user/starred/'+user+'/'+repo)
    .then(res => res.json())
    .then(json => {
      redis.del('repos');
      res.send(json);
    });
});

redisclient.on('connect', function() {
    console.log('redis connected');
});

redisclient.on('error', err => {
  // handle the err here or just ignore them
  console.log(err);
});

app.use('/', express.static(PUBLIC_FOLDER));

server.listen(PORT, () => {
    console.log(`Server started on port ${server.address().port}`);
});
