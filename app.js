import express from 'express';

//import { getPlayers, getTeams, getGames, getPlayer, getTeam, getGame } from './database.js';

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/getPlayers', (req, res) => {
  res.send('players test');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
