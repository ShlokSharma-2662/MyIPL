import { USER_BAT_SR, USER_BAT_AVG, USER_BOWL_SR, USER_BOWL_ECON, USER_TEAM } from './constants';

export const TEAMS = [
  { id: 'CSK', name: 'Chennai Super Kings', short: 'CSK', primary: '#F9CD05', dark: '#1E4D8C' },
  { id: 'MI',  name: 'Mumbai Indians',      short: 'MI',  primary: '#004BA0', dark: '#D1AB3E' },
  { id: 'RCB', name: 'Royal Challengers',   short: 'RCB', primary: '#DA1818', dark: '#000000' },
  { id: 'KKR', name: 'Kolkata Knight Riders',short: 'KKR', primary: '#3A225D', dark: '#F9CD05' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', short: 'SRH', primary: '#F7A721', dark: '#DC271B' },
  { id: 'DC',  name: 'Delhi Capitals',      short: 'DC',  primary: '#17479E', dark: '#EF1B23' },
  { id: 'RR',  name: 'Rajasthan Royals',    short: 'RR',  primary: '#EA1A85', dark: '#254AA5' },
  { id: 'PBKS',name: 'Punjab Kings',        short: 'PBKS',primary: '#DD1F2D', dark: '#A7A9AC' },
  { id: 'GT',  name: 'Gujarat Titans',      short: 'GT',  primary: '#1B2133', dark: '#B5A06F' },
  { id: 'LSG', name: 'Lucknow Super Giants',short: 'LSG', primary: '#00B5EA', dark: '#F9CD05' },
];

// Compact: [name, role, batSR, batAvg, bowlSR or null, bowlEcon or null]
export const ROSTERS = {
  CSK: [
    ['Ruturaj Gaikwad','BAT',148,42,null,null],
    ['Ravindra Jadeja','AR',150,30,22,7.6],
    ['Shivam Dube','AR',158,28,24,9.2],
    ['MS Dhoni','WK',175,30,null,null],
    ['Rachin Ravindra','BAT',142,32,28,7.8],
    ['Moeen Ali','AR',145,26,26,8.1],
    ['Ravichandran Ashwin','BOWL',110,14,20,7.4],
    ['Deepak Chahar','BOWL',130,12,18,8.3],
    ['Mustafizur Rahman','BOWL',80,8,17,7.9],
    ['Matheesha Pathirana','BOWL',90,7,16,8.4],
    ['Shardul Thakur','AR',145,18,18,8.8],
  ],
  MI: [
    ['Rohit Sharma','BAT',152,38,null,null],
    ['Ishan Kishan','WK',140,32,null,null],
    ['Suryakumar Yadav','BAT',170,36,null,null],
    ['Tilak Varma','BAT',145,34,null,null],
    ['Hardik Pandya','AR',158,28,21,8.7],
    ['Tim David','BAT',175,26,null,null],
    ['Piyush Chawla','BOWL',130,10,22,8.1],
    ['Gerald Coetzee','BOWL',110,9,17,8.8],
    ['Jasprit Bumrah','BOWL',95,8,15,6.9],
    ['Akash Madhwal','BOWL',100,7,19,8.4],
    ['Kumar Kartikeya','BOWL',105,8,23,7.8],
    ['Nehal Wadhera','BAT',148,28,null,null],
  ],
  RCB: [
    ['Virat Kohli','BAT',150,44,null,null],
    ['Faf du Plessis','BAT',152,36,null,null],
    ['Glenn Maxwell','AR',168,28,25,8.5],
    ['Rajat Patidar','BAT',150,30,null,null],
    ['Dinesh Karthik','WK',165,28,null,null],
    ['Cameron Green','AR',155,28,24,8.7],
    ['Anuj Rawat','WK',135,24,null,null],
    ['Mohammed Siraj','BOWL',105,9,18,8.2],
    ['Yash Dayal','BOWL',110,8,19,8.6],
    ['Harshal Patel','BOWL',140,11,20,8.8],
    ['Mayank Dagar','BOWL',100,7,24,7.9],
    ['Mahipal Lomror','AR',145,24,28,8.5],
  ],
  KKR: [
    ['Sunil Narine','AR',170,22,22,6.8],
    ['Phil Salt','WK',162,30,null,null],
    ['Venkatesh Iyer','BAT',148,32,28,8.2],
    ['Shreyas Iyer','BAT',146,34,null,null],
    ['Nitish Rana','BAT',142,30,26,8.5],
    ['Andre Russell','AR',180,25,19,9.1],
    ['Rinku Singh','BAT',158,32,null,null],
    ['Mitchell Starc','BOWL',115,10,16,8.4],
    ['Harshit Rana','BOWL',105,8,19,8.9],
    ['Varun Chakaravarthy','BOWL',95,7,18,7.2],
    ['Vaibhav Arora','BOWL',100,7,20,8.5],
    ['Suyash Sharma','BOWL',80,6,17,8.1],
  ],
  SRH: [
    ['Abhishek Sharma','BAT',175,28,26,8.3],
    ['Travis Head','BAT',180,34,null,null],
    ['Aiden Markram','AR',148,30,27,8.1],
    ['Rahul Tripathi','BAT',145,28,null,null],
    ['Heinrich Klaasen','WK',175,32,null,null],
    ['Abdul Samad','BAT',155,24,null,null],
    ['Washington Sundar','AR',130,24,24,7.5],
    ['Pat Cummins','BOWL',145,12,17,8.5],
    ['Bhuvneshwar Kumar','BOWL',115,10,20,7.8],
    ['Mayank Markande','BOWL',100,7,21,8.6],
    ['T Natarajan','BOWL',105,7,18,8.9],
    ['Shahbaz Ahmed','AR',135,22,25,7.9],
  ],
  DC: [
    ['David Warner','BAT',148,40,null,null],
    ['Prithvi Shaw','BAT',155,28,null,null],
    ['Mitchell Marsh','AR',150,32,24,8.7],
    ['Rishabh Pant','WK',160,36,null,null],
    ['Tristan Stubbs','BAT',155,28,null,null],
    ['Axar Patel','AR',140,26,23,7.4],
    ['Kuldeep Yadav','BOWL',105,9,18,7.9],
    ['Anrich Nortje','BOWL',115,9,16,8.5],
    ['Mukesh Kumar','BOWL',100,7,19,8.8],
    ['Khaleel Ahmed','BOWL',110,8,19,9.0],
    ['Ishant Sharma','BOWL',105,7,21,9.1],
    ['Abishek Porel','WK',155,28,null,null],
  ],
  RR: [
    ['Jos Buttler','WK',155,38,null,null],
    ['Yashasvi Jaiswal','BAT',158,36,null,null],
    ['Sanju Samson','BAT',150,34,null,null],
    ['Riyan Parag','BAT',148,26,25,8.4],
    ['Shimron Hetmyer','BAT',160,28,null,null],
    ['Dhruv Jurel','WK',135,26,null,null],
    ['Ravichandran Ashwin','BOWL',110,14,20,7.4],
    ['Yuzvendra Chahal','BOWL',105,9,18,7.8],
    ['Avesh Khan','BOWL',110,8,18,8.9],
    ['Trent Boult','BOWL',115,10,17,8.3],
    ['Nandre Burger','BOWL',100,7,18,8.7],
    ['Rovman Powell','BAT',160,25,null,null],
  ],
  PBKS: [
    ['Shikhar Dhawan','BAT',140,40,null,null],
    ['Prabhsimran Singh','WK',150,28,null,null],
    ['Sam Curran','AR',140,28,22,9.1],
    ['Liam Livingstone','AR',165,30,23,8.5],
    ['Jonny Bairstow','BAT',150,34,null,null],
    ['Jitesh Sharma','WK',155,26,null,null],
    ['Shashank Singh','BAT',160,28,null,null],
    ['Harpreet Brar','AR',130,22,24,7.6],
    ['Arshdeep Singh','BOWL',115,9,17,8.6],
    ['Kagiso Rabada','BOWL',125,11,16,8.4],
    ['Nathan Ellis','BOWL',110,8,18,8.7],
    ['Ashutosh Sharma','BAT',175,32,null,null],
  ],
  GT: [
    ['Shubman Gill','BAT',150,42,null,null],
    ['Wriddhiman Saha','WK',135,28,null,null],
    ['Sai Sudharsan','BAT',145,34,null,null],
    ['David Miller','BAT',150,32,null,null],
    ['Vijay Shankar','AR',140,26,26,8.4],
    ['Rahul Tewatia','AR',148,24,25,8.1],
    ['Rashid Khan','AR',160,20,18,6.9],
    ['Mohit Sharma','BOWL',120,9,18,8.5],
    ['Mohammed Shami','BOWL',115,10,17,8.1],
    ['Umesh Yadav','BOWL',110,8,19,8.9],
    ['Noor Ahmad','BOWL',105,8,19,7.6],
    ['R Sai Kishore','BOWL',105,12,20,7.3],
  ],
  LSG: [
    ['KL Rahul','WK',148,42,null,null],
    ['Quinton de Kock','WK',145,32,null,null],
    ['Devdutt Padikkal','BAT',140,30,null,null],
    ['Nicholas Pooran','BAT',170,30,null,null],
    ['Marcus Stoinis','AR',155,28,24,9.0],
    ['Krunal Pandya','AR',135,24,24,7.5],
    ['Deepak Hooda','AR',138,24,26,8.2],
    ['Mohsin Khan','BOWL',110,8,18,8.3],
    ['Naveen-ul-Haq','BOWL',115,8,18,8.6],
    ['Ravi Bishnoi','BOWL',105,8,19,7.9],
    ['Yash Thakur','BOWL',100,7,20,8.8],
    ['Ayush Badoni','BAT',145,28,null,null],
  ],
};

export function toPlayer(tup, teamId) {
  const [name, role, batSR, batAvg, bowlSR, bowlEcon] = tup;
  return {
    name, role, team: teamId,
    batSR, batAvg,
    bowls: bowlSR !== null,
    bowlSR: bowlSR || 0,
    bowlEcon: bowlEcon || 0,
  };
}

export function buildAllPlayers(userName) {
  const players = {};
  players[`USER:${userName}`] = {
    name: userName, role: 'BAT', team: USER_TEAM,
    batSR: USER_BAT_SR, batAvg: USER_BAT_AVG,
    bowls: true, bowlSR: USER_BOWL_SR, bowlEcon: USER_BOWL_ECON,
    isUser: true,
  };
  for (const teamId of Object.keys(ROSTERS)) {
    ROSTERS[teamId].forEach(tup => {
      const p = toPlayer(tup, teamId);
      players[`${teamId}:${p.name}`] = p;
    });
  }
  return players;
}

export function getLineup(teamId, userName, playersMap) {
  if (teamId === USER_TEAM) {
    const lineup = [playersMap[`USER:${userName}`]];
    ROSTERS[USER_TEAM].forEach(tup => {
      lineup.push(playersMap[`${USER_TEAM}:${tup[0]}`]);
    });
    return lineup;
  }
  return ROSTERS[teamId].map(tup => playersMap[`${teamId}:${tup[0]}`]);
}

export function playerKey(p) {
  return p.isUser ? `USER:${p.name}` : `${p.team}:${p.name}`;
}
