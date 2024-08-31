# MLS-db
- This web app connects to a MySQL database filled with player, team, and game statistics for the MLS 2021-2023 seasons and contains several complex queries about the players and teams from these seasons.
## Create the MLS_DB SQL server
- Using the create_db.sql file in the mls_data folder, create the MySQL database that the app will query.
- Next, insert the data into the database by running insertData.js, also in the mls_data folder.
## Make sure you create a .env file to store the credentials to access your database:
- host: MYSQL_HOST
- database port: MYSQL_PORT
- database username: MYSQL_USER
- database password: MYSQL_PASSWORD
- database name: MYSQL_DATABASE
## Run the app
- use `npm run dev` to start the app locally
