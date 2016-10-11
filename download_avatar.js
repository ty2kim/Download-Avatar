'use strict';

// import modules
const request = require('request');
const fs = require('fs');

// directory name
const dir = './avatars/';
const root = 'https://api.github.com/';

let args = process.argv.splice(2);
let storage = {};
//let starredInfo = [];

// downloadImageByURL
function downloadImageByURL(url, filePath) {
  // create folder
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } request(url).pipe(fs.createWriteStream(filePath)); // download avatar to specified folder
}

function getFiveRecomRepo(login) {
  const options = {
    url: `${root}users/${login}/starred`,
    auth: {
      bearer: process.env.DB_TOKEN,
    },
    headers: {
      'User-Agent': 'ty2kim',
    },
  };
  request.get(options, function (err, response, body) {
    if (err) {
      throw err;
    } const data = JSON.parse(body);

    for (let person in data) {
      let repoOwner = data[person].owner.login;
      let repoName = data[person].name;
      let pair = `${repoOwner} / ${repoName}`;
      if (!storage[pair]) {
        storage[pair] = [pair, 1];
      } else {
        storage[pair][1]++;
      }
    }
  });
}

function repoContCb(err, response, body) {
  // error handling
  if (err) {
    throw err;
  } const data = JSON.parse(body);

  if (data.message === 'Not Found') {
    console.log('Provided owner/repo does not exist');
    return;
  }

  for (let person in data) {
    downloadImageByURL(data[person].avatar_url, 'avatars/' + data[person].login + '.png');
    getFiveRecomRepo(data[person].login);
  }
}

// getRepoContributors
function getRepoContributors(repoOwner, repoName, cb) {
  // https://api.github.com/repos/lighthouse-labs/laser_shark/contributors
  const options = {
    url: `${root}repos/${repoOwner}/${repoName}/contributors`,
    auth: {
      bearer: process.env.DB_TOKEN,
    },
    headers: {
      'User-Agent': 'ty2kim',
    },
  };
  request.get(options, cb);
}

function run(args) {
  if (args.length != 2) {
    console.log('Incorrect number of arguments');
  } else if (!fs.existsSync('.env')) {
    console.log('.env file is missing');
  } else {
    let env = require('dotenv').config();
    getRepoContributors(args[0], args[1], repoContCb);
  }
}

run(args);
setTimeout(function () {
  var rank = [];
  for (let pair in storage) {
    rank.push(storage[pair]);
    rank.sort(function(a,b){
      return b[1] - a[1];
    });
  }
  console.log(rank);
}, 5000);
