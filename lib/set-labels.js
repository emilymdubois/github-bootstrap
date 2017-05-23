'use strict';

const queue = require('d3-queue').queue;
const request = require('request');
const url = require('url');

module.exports = (options, callback) => {
  validate(options, (err, options) => {
    if (err) return callback(new Error(err));
    getLabels(options, (err, existing) => {
      if (err) return callback(new Error(err));

      const q = queue(1);
      options.existing = existing;
      q.defer(deleteLabels, options);
      q.defer(putLabels, options);
      q.awaitAll((err) => {
        if (err) return callback(new Error(err));
        return callback(null, 'Successfully created labels!');
      });
    });
  });
};

module.exports.validate = validate;
function validate(options, callback) {
  if (!options.owner) return callback('owner is required');
  if (!options.repo) return callback('repo is required');
  if (!options.token && !process.env.GitHubAccessToken) return callback('--token or process.env.GitHubAccessToken is required');
  if (process.env.GitHubAccessToken) options.token = process.env.GitHubAccessToken;

  try { options.config = require(`${__dirname}/../config.json`); }
  catch (err) { return callback('config.json file is required in github-bootstrap root.'); }
  return callback(null, options);
}

module.exports.getLabels = getLabels;
function getLabels(options, callback) {
  callApi({
    url: `https://api.github.com/repos/${options.owner}/${options.repo}/labels`,
    method: 'GET',
    user_agent: options.owner,
    access_token: options.token
  }, callback);
}

module.exports.deleteLabels = deleteLabels;
function deleteLabels(options, callback) {
  const q = queue(1);
  options.existing.forEach((e) => {
    const params = {
      url: url.format(`https://api.github.com/repos/${options.owner}/${options.repo}/labels/${e.name}`),
      method: 'DELETE',
      user_agent: options.owner,
      access_token: options.token
    };
    q.defer(callApi, params);
  });
  q.awaitAll((err, res) => {
    if (err) return callback(new Error(err));
    return callback(null, res);
  });
}

module.exports.putLabels = putLabels;
function putLabels(options, callback) {
  const q = queue(1);
  for (const name in options.config.labels) {
    q.defer(callApi, {
      url: `https://api.github.com/repos/${options.owner}/${options.repo}/labels`,
      method: 'POST',
      user_agent: options.owner,
      access_token: options.token,
      body: JSON.stringify({
        name: name,
        color: options.config.labels[name].match(/^#?(.*)$/)[1]
      })
    });
  }
  q.awaitAll(callback);
}

module.exports.callApi = callApi;
function callApi(options, callback) {
  const params = {
    method: options.method,
    url: options.url,
    headers: {
      'User-Agent': options.user_agent,
      Authorization: `token ${options.access_token}`
    }
  };
  if (options.body) params.body = options.body;

  request(params, (err, res, body) => {
    if (err) return callback(err);
    if (res.statusCode > 299) { return callback(`HTTP status code ${res.statusCode}: ${JSON.parse(body).message}`); }
    if (res.statusCode === 204) return callback();

    try { body = JSON.parse(body); }
    catch (err) { return callback(err); }
    return callback(null, body);
  });
}
