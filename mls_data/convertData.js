const fs = require('fs');

// Read the original JSON data from files
const data = [ JSON.parse(fs.readFileSync('2021playersbyteam.json', 'utf-8')),
    JSON.parse(fs.readFileSync('2022playersbyteam.json', 'utf-8')),
    JSON.parse(fs.readFileSync('2023playersbyteam.json', 'utf-8')) ];

// Function to split the name into first_name and last_name
function splitName(player) {
    const nameParts = player.name.split(', ');
    if (nameParts.length === 2) {
        player.first_name = nameParts[1];
        player.last_name = nameParts[0];
        delete player.name; // Remove the original name attribute
    } else if (nameParts.length === 1) {
        player.first_name = nameParts[0];
        player.last_name = "";
        delete player.name;
    }
}

let year = 2021;
let team_id = 1;
let player_id = 1000;
let game_id = 5000;

data.forEach(season => {
    // Loop through the JSON data and split the names for each player
    season.season_competitor_players.forEach(team => {
        team.players.forEach(player => {
            splitName(player);
        });
    });

    fs.writeFileSync(`${year}playersbyteam-new.json`, JSON.stringify(season, null, 2));
    year++;
});
