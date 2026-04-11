// =============================================================================
//  state.js — Estado global de runtime
// =============================================================================

const authMap = new Map(); // Map<playerId, {auth, conn}>

// Estado del juego
let gameState     = 2; // 0=jugando, 1=pausado, 2=detenido
let playSituation = 0; // 0=kickoff, 1=primer toque, 2=en juego
let goldenGoal    = false;
let lastWinner    = 0;
let streak        = 0;

// Equipos
let playersAll    = [];
let players       = [];
let teamRed       = [];
let teamBlue      = [];
let teamSpec      = [];
let teamRedStats  = [];
let teamBlueStats = [];

// Stats de partido
let possession     = [0, 0];
let actionZoneHalf = [0, 0];
let banList        = [];
let roomPassword   = "";

// Física
let ballSpeed        = 0;
let playerRadius     = 15;
let ballRadius       = 10;
let triggerDistance  = playerRadius + ballRadius + 0.01;
let speedCoefficient = 1;
let checkStadiumVariable = true;

// Control de flujo
let game               = new Game();
let lastTouches        = [null, null];
let lastTeamTouched    = 0;
let endGameVariable    = false;
let cancelGameVariable = false;
let kickFetchVariable  = false;
let chooseMode         = false;
let capLeft            = false;
let redCaptainChoice   = "";
let blueCaptainChoice  = "";
let removingPlayers    = false;
let insertingPlayers   = false;
let checkTimeVariable  = false;
let slowMode           = 0;
let currentStadium     = "classic";

// Timeouts
let timeOutCap, startTimeout, stopTimeout, unpauseTimeout, removingTimeout, insertingTimeout;

// Sets y Maps de estado
const AFKSet        = new Set();
const AFKMinSet     = new Set();
const SMSet         = new Set();
const avatarEnabled = new Set();
const prevPositions = new Map();
const muteArray     = new MuteList();
const spamDetection = new SpamDetection();

// Cooldowns
const afkCooldownTimes  = new Map();
const anonCooldownTimes = new Map();
const jumpCooldowns     = new Map();

// Votekick
const voteKickData = {
  active: false, target: null, initiator: null,
  votes: 0, voters: new Set(), requiredVotes: 0, timeout: null,
};

const emptyPlayer = { id: 0 };

