import express from 'express';

import { getPlayers, getTeams, getGames } from './database.js';

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/getPlayers', async (req, res) => {
  const players = await getPlayers();
  res.send(players);
});

app.get("/getTeams", async (req, res) => {
  const teams = await getTeams();
  res.send(teams);
});

app.get("/getGames", async (req, res) => {
  const games = await getGames();
  res.send(games);
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
