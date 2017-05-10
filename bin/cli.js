#!/usr/bin/env node
/* eslint-disable no-console */

'use strict';

const meow = require('meow');

const cli = meow({
  help: `
    Usage: gh-bootstrap <command> [options]
    Commands:
      make-config           create a config.json file in root directory
      set-labels            set the labels for the provided repository
    Options:
      -h, --help            show this help message
      -o, --owner           GitHub repository owner name
      -r, --repo            GitHub repository name
      -t, --token           GitHub access token with repo scopes
  `,
  description: 'A CLI for bootstrapping GitHub labels'
}, {
  alias: {
    o: 'owner',
    r: 'repo',
    t: 'token'
  },
  string: ['owner', 'repo', 'token']
});

const command = cli.input[0];

let fn;
try { fn = require(`../lib/${command}`); }
catch (err) {
  console.error(`\n${err.message}\n`);
  cli.showHelp(1);
}

fn(cli.flags, (err, res) => {
  if (err) console.log(`\n${err.message}\n`);
  if (res) console.log(`\n${res}\n`);
});
