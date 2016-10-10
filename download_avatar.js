// https://api.github.com/repos/lighthouse-labs/laser_shark/contributors

'use strict';

// import modules
let request = require('request');
let fs = require('fs');

// directory name
const dir = './avatars/';

// url with user-agent
const options = {
  url: '',
  headers: {
    'User-Agent': 'ty2kim',
  },
};

// downloadImageByURL
function downloadImageByURL(url, filePath) {
  // create folder
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } request(url).pipe(fs.createWriteStream(filePath)); // download avatar to specified folder
}

// callback
function callback(err, response, body) {
  // error handling
  if (err) {
    throw err;
  } const data = JSON.parse(body); // conver string to object

  // iterate through object
  for (person in data) {
    downloadImageByURL(data[person].avatar_url, 'avatars/' + data[person].login + '.png');
  }
}

// getRepoContributors
function getRepoContributors(repoOwner, repoName, cb) {
  options.url = 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors'; // update url to github api
  request(options, cb); // request call
}

getRepoContributors(process.argv[2], process.argv[3], callback);
