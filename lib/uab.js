const axios = require('axios').default;

const CLI = require('clui');
const Configstore = require('configstore');
const Spinner = CLI.Spinner;

const inquirer = require('./inquirer');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

const passwordKey = 'password';
const sidKey = 'sid';
const userIdKey = 'userId';
const usernameKey = 'username';

const baseUrl = `https://uabmagic-api.vercel.app/api`

module.exports = {
  getStoredToken: () => {
    return conf.get(sidKey);
  },

  getStoredUserId: () => {
    return conf.get(userIdKey);
  },

  getTokenFromUAB: async () => {
    let username = conf.get(usernameKey);
    let password = conf.get(passwordKey);

    if (!username && !password) {
      const credentials = await inquirer.askUABCredentials();

      username = credentials.username;
      conf.set(usernameKey, credentials.username);

      password = credentials.password;
      conf.set(passwordKey, credentials.password);
    }

    const status = new Spinner(`Authenticating you, please wait...`);

    status.start();

    const url = `${baseUrl}/auth/login`;

    try {
      const sid = axios.post(url, { username, password }).then(function (response) {
        if (response.status == 200) {
          conf.set(sidKey, response.data.sid);
          conf.set(userIdKey, response.data.userId);

          return response.data.sid;
        }
      });

      return sid;
    } finally {
      status.stop();
    }
  },

  search: async (query) => {
    const status = new Spinner(`Searching, please wait...`);
    status.start();

    const url = `${baseUrl}/search/${query}`;

    try {
      const results = axios.get(url).then(function (response) {
        if (response.status == 200) {
          return response.data.results;
        }
      });

      return results;
    } finally {
      status.stop();
    }
  },

  request: async (songId) => {
    const status = new Spinner(`Requesting, please wait...`);
    status.start();

    const userId = conf.get(userIdKey);
    const sid = conf.get(sidKey);

    const url = `${baseUrl}/request`;
    const data = { songId };
    const headers = {
      'Authorization': `${userId}:${sid}`
    };

    try {
      const results = axios.post(url, data, { headers }).then(function (response) {
        if (response.status == 200) {
          return response.data;
        }
      });

      return results;
    } finally {
      status.stop();
    }
  },

  nowPlaying: async () => {
    const status = new Spinner(`Getting current song, please wait...`);
    status.start();

    const url = `${baseUrl}/songs/nowplaying`;

    try {
      const results = axios.get(url).then(function (response) {
        if (response.status == 200) {
          return response.data;
        }
      });

      return results;
    } finally {
      status.stop();
    }
  }
};
