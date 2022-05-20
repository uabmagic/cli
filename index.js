#!/usr/bin/env node

const arg = require('arg');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { Table } = require('console-table-printer');

const uab = require('./lib/uab');

const getUABToken = async () => {
  return await uab.getTokenFromUAB();
};

const newline = (lines = 1) => {
  if (lines > 0) {
    console.log(``);

    newline(lines - 1);
  }
}

const args = arg({
  '--nowplaying': Boolean,
  '-n': '--nowplaying',

  '--request': Number,
  '-r': '--request',

  '--search': String,
  '-s': '--search',

  '--raw': Boolean
});

const run = async () => {
  try {
    await getUABToken();

    const displayRaw = args[`--raw`];

    if (!displayRaw) {
      clear();

      console.log(
        chalk.cyan(
          figlet.textSync('UABMagic', { horizontalLayout: 'full' })
        )
      );

      newline();
    }

    if (args[`--search`]) {
      const query = encodeURIComponent(args[`--search`]);

      const searchResults = await uab.search(query);

      if (displayRaw) {
        console.log(searchResults);
      } else {
        const resultTable = new Table({
          title: 'Search results',
          columns: [
            { name: 'attractionAndSong', title: 'Song title', alignment: 'left' },
            { name: 'duration', title: 'Duration', alignment: 'left' },
            { name: 'id', title: 'Song ID', alignment: 'left' }
          ]
        });

        searchResults.map((result) => {
          resultTable.addRow({
            attractionAndSong: result.attractionAndSong,
            duration: result.playback.durationDisplay,
            id: result.id
          });
        });

        resultTable.printTable();

        newline();
      }
    }

    if (args[`--request`]) {
      const requestedSongId = args[`--request`];

      const requestResults = await uab.request(requestedSongId);

      if (requestResults.success) {
        console.log(chalk.green(`Song successfully requested!`));
      } else {
        console.log(chalk.red(`An error occurred while requesting song: ${requestResults.failureReason}`));
      }

      newline();
    }

    if (args[`--nowplaying`]) {
      const nowPlaying = await uab.nowPlaying();

      if (displayRaw) {
        console.log(nowPlaying);
      } else {
        console.log(chalk.white(`Now playing: ${nowPlaying.schedule}`));
        newline();

        const time = `(${nowPlaying.playback.timeElapsedDisplay} / ${nowPlaying.playback.durationDisplay})`;

        console.log(`  ${nowPlaying.themeParkAndLand.toUpperCase()}`);
        console.log(`  ${chalk.cyan(nowPlaying.attractionAndSong)} ${time}`);

        if (nowPlaying.requestor !== '') {
          newline();
          console.log(`  Requested by ${chalk.yellow(nowPlaying.requestor)}`);
        }

        newline(2);

        console.log(`Up next:`);

        nowPlaying.upNext.map((song) => {
          console.log(`  - ${song}`);
        });
      }
    }
  } catch(err) {
    if (err) {
      console.error(err);
    }
  }
};

run();
