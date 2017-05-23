# gh-bootstrap

Utility scripts to bootstrap GitHub repositories the way you like them.

![](https://img.playbuzz.com/image/upload/c_crop,h_300,w_500,x_0,y_0/f_auto,fl_lossy,q_auto/c_limit,w_640/v1485843319/lw1yhxv1vkzh2zecgthz.gif)

## Install

```sh
$ git clone git@github.com:emilymdubois/gh-bootstrap.git
$ cd gh-bootstrap
$ npm link
```

## Set up configuration file

```sh
$ gh-bootstrap make-config
```

This will create a `config.json` file in the root directory of your local gh-bootstrap clone.

## Configure labels in repository of interest

```sh
$ gh-bootstrap set-labels -o <owner> -r <repo>
$ gh-bootstrap set-labels -o <owner> -r <repo> -t <access_token>
```

This will delete any labels currently in the repository, and create labels from the configuration file in the root directory. You will need to provide a GitHub access token with repo permissions. You can do this by:

1. Setting the `process.env.GitHubAccessToken` environment variable, or by
1. Waving a `-t` or `-token` flag.


## Test

```sh
$ npm test
```
