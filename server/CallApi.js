var express = require('express');
var CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
var app = express();

class CallApi {
  async getAllRepos() {
    console.log(new Date());
    var date = new Date();

    fetch(url + '/search/repositories?q=stars:>=1000')
    .then(res => res.json())
    .then(json => {
      return json;
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

module.exports = CallApi;
