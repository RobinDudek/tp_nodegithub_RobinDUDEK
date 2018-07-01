var https = require('https');
var url = 'https://api.github.com';
var CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

class CallApi {
  constructor() {

  }

  getAllRepos() {
    var options = {
      host: url,
      port: 80,
      path: '/search/repositories?q=created:' + new Date(),
      method: 'GET'
    };

    var request = https.request(options, function(res) {
      var body = '';
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
        body += chunk;
      });
      res.on('end',function(){
          var json = JSON.parse(body);
          var repos =[];
          json.forEach(function(repo){
              repos.push({
                  name : repo.name,
                  description : repo.description
              });
          });
          return JSON.stringify(repos);
      });
    });
  } //end of getAllRepos

  login(user, password) {
    var options = {
      host: url,
      port: 80,
      path: '/search/repositories?q=' + new Date(),
      method: 'GET'
    };
  }

} // end of CallApi
