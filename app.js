const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

//accept json data
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get list Players
app.get("/players/", async (request, response) => {
  const teamQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(teamQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//2 API save data
app.post("/players/", async (request, response) => {
  const teamDetails = request.body;
  const { playerName, jerseyNumber, role } = teamDetails;
  const teamQuery = `INSERT into cricket_team(player_name,jersey_number,role) values
   (
       '${playerName}','${jerseyNumber}','${role}'
   );`;
  const dbResponse = await db.run(teamQuery);
  response.send("Player Added to Team");
});
//3 API Get single value
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const teamQuery = `SELECT * FROM cricket_team where player_id='${playerId}';`;
  const playersArray = await db.all(teamQuery);
  const getPlayer = playersArray.map((eachPlayer) =>
    convertDbObjectToResponseObject(eachPlayer)
  );
  response.send(getPlayer[0]);
});
//4 API update
app.put("/players/:playerId/", async (request, response) => {
  const teamDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = teamDetails;
  const teamQuery = `update cricket_team set player_name='${playerName}',jersey_number='${jerseyNumber}'
  ,role='${role}' where player_id='${playerId}'`;
  const dbResponse = await db.run(teamQuery);
  response.send("Player Details Updated");
});
//5 API Delete single value
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const teamQuery = `DELETE FROM cricket_team where player_id='${playerId}';`;
  const teamMates = await db.exec(teamQuery);
  response.send("Player Removed");
});
module.exports = app;
