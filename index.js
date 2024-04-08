/* eslint-disable no-param-reassign */
/* eslint-disable no-loop-func */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable wrap-iife */
/* eslint-disable no-return-assign */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable max-classes-per-file */
const winnerContainer = document.getElementById('winner-container');
const winnerText = document.getElementById('winner-text');

class Ship {
  constructor(name, length, timesHit = 0, isSunkVal = false) {
    this.name = name;
    this.identifier = this.name[0].toUpperCase();
    this.length = length;
    this.timesHit = timesHit;
    this.isSunkVal = isSunkVal;
  }

  hit() {
    this.timesHit++;
    return this.isSunk();
  }

  isSunk() {
    if (this.length === this.timesHit) {
      this.isSunkVal = true;
      return 'ship sank';
    }
  }
}

function gameboard(size) {
  const board = [];

  const hits = 0;

  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i][j] = 0;
    }
  }

  function getValue(x, y) {
    return board[x][y];
  }

  function setShip(x, y, ship) {
    return board[x][y] = ship;
  }

  return { board, getValue, setShip };
}

class Player {
  constructor(board) {
    this.board = board;
    this.aircraft5 = new Ship('aircraft', 5);
    this.battleship4 = new Ship('battleship', 4);
    this.cruiser3 = new Ship('cruiser', 3);
    this.submarine3 = new Ship('submarine', 3);
    this.destroyer2 = new Ship('destroyer', 2);
    this.hitsRemaining = 0;
    this.shipsArr = [
      this.aircraft5,
      this.battleship4,
      this.cruiser3,
      this.submarine3,
      this.destroyer2,
    ];
  }
}

const player = new Player(gameboard(10));
const computer = new Player(gameboard(10));
player.enemyBoard = computer.board.board;
computer.enemyBoard = player.board.board;

player.board.setShips = (x, y, vertex = 'horizontal') => {
  // create array for the downstream ship positions to verify no overlap bt ships
  const shipPositionsArr = [];
  const currentShip = player.shipsArr.shift();

  // validate starting position
  if (x >= 10 || x < 0 || y >= 10 || y < 0) {
    // return currentShip back to array in case of placement error
    player.shipsArr.unshift(currentShip);
    return 'please enter a valid position for 1 <= (x,y) <= 10';
  }
  // verify ship doesn't fall off the board horizontally
  if (vertex == 'horizontal') {
    // set up downhill x positions
    for (let i = 0; i < currentShip.length; i++) {
      if (player.board.getValue(x, y + i) != 0) {
        // return currentShip back to array in case of placement error
        player.shipsArr.unshift(currentShip);
        return 'please enter a more inspiring position';
      }
      shipPositionsArr.push([x, y + i]);
    }
  }

  // verify ship doesn't fall off the board vertically
  if (vertex == 'vertical') {
    // set up downhill y positions
    for (let i = 0; i < currentShip.length; i++) {
      if (player.board.getValue(x + i, y) != 0) {
        player.shipsArr.unshift(currentShip);
        return 'please enter a more inspiring position';
      }
      shipPositionsArr.push([x + i, y]);
    }
  }

  shipPositionsArr.forEach((position) => {
    player.board.setShip(position[0], position[1], currentShip);
    document.getElementById(`player-btn-${position[0]},${position[1]}`).style.backgroundColor = '#b58604';
    document.getElementById(`player-btn-${position[0]},${position[1]}`).style.color = '#b58604';
  });
  player.hitsRemaining += currentShip.length;
};

// generate computer board positions for random selection
const computerShipPositions = (function () {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      arr.push(([i, j]));
    }
  }
  return arr;
})();

const generateRandomNum = (size) => Math.floor(Math.random() * size);
const verteces = ['horizontal', 'vertical'];

computer.board.setShips = () => {
  const computerPlacements = [];
  const currentShip = computer.shipsArr.shift();
  const vertex = verteces[generateRandomNum(verteces.length)];
  const startingPosition = computerShipPositions[generateRandomNum(100)];

  if (startingPosition[0] + currentShip.length >= 10
    || startingPosition[1] + currentShip.length >= 10) {
    // return currentShip back to array in case of placement error
    computer.shipsArr.unshift(currentShip);
    return computer.board.setShips();
  }

  if (vertex == 'horizontal') {
    for (let i = 0; i < currentShip.length; i++) {
      if (computer.board.getValue(startingPosition[0], startingPosition[1] + i) != 0
      && startingPosition[0] + currentShip.length < 10
      && startingPosition[1] + currentShip.length < 10) {
        computer.shipsArr.unshift(currentShip);
        return computer.board.setShips();
      }
      computerPlacements.push([startingPosition[0], startingPosition[1] + i]);
    }
  }
  if (vertex == 'vertical') {
    for (let i = 0; i < currentShip.length; i++) {
      if (computer.board.getValue(startingPosition[0] + i, startingPosition[1]) != 0
      && startingPosition[0] + currentShip.length < 10
      && startingPosition[1] + currentShip.length < 10) {
        computer.shipsArr.unshift(currentShip);
        return computer.board.setShips();
      }
      computerPlacements.push([startingPosition[0] + i, startingPosition[1]]);
    }
  }

  return computerPlacements.forEach((position) => {
    computer.board.setShip(position[0], position[1], currentShip);
    computer.hitsRemaining += 1;
  });
};

computer.board.setAllShips = () => {
  while (computer.shipsArr.length > 0) {
    computer.board.setShips();
  }
};

player.sendAttack = (position) => {
  const [x, y] = position;
  let currentShip;

  if (player.enemyBoard[x][y] != 0) {
    currentShip = player.enemyBoard[x][y];
    player.enemyBoard[x][y] = 'HIT';
    currentShip.hit();
    computer.hitsRemaining -= 1;

    if (computer.hitsRemaining == 0) {
      endGame();
      winnerContainer.classList.add('winner-declaration');
      return winnerText.textContent = "CONGRATULATIONS.  YOU'VE BEATEN THE GENIUS AI";
    }
    return setTimeout(() => {
      computer.calculateAttack();
    }, 200);
  }
  player.enemyBoard[x][y] = 'MISS';
  return setTimeout(() => {
    computer.calculateAttack();
  }, 200);
};

// generate computer attack

const computerAttackPositions = (function () {
  const arr = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      arr.push(([i, j]));
    }
  }
  return arr;
}());

const computerUsedAttacks = [];

let adjacentAttackPositions = [];

computer.sendAttack = (x, y) => {
  if (player.board.getValue(x, y) == 0) {
    computer.enemyBoard[x][y] = 'MISS';
    player.board.board[x][y] = 'MISS';
    document.getElementById(`player-btn-${x},${y}`).style.opacity = '0';
    return;
  }

  if (player.board.getValue(x, y) == 'MISS' || player.board.getValue(x, y) == 'HIT') {
    return console.log('********MISS', x, y, adjacentAttackPositions);
  }

  const currentShip = player.board.getValue(x, y);
  currentShip.hit();
  adjacentAttackPositions.push(
    [x, y + 1],
    [x + 1, y],
    [x, y - 1],
    [x - 1, y],
  );
  // 1,3
  adjacentAttackPositions = adjacentAttackPositions.filter((pos) => pos[0] >= 0
    && pos[1] >= 0
    && pos[0] < 10
    && pos[1] < 10);

  adjacentAttackPositions = filterDuplicates(adjacentAttackPositions);
  adjacentAttackPositions = filterAlreadyHit(adjacentAttackPositions);

  computer.enemyBoard[x][y] = 'HIT';
  player.hitsRemaining -= 1;
  document.getElementById(`player-btn-${x},${y}`).style.backgroundColor = 'red';
  document.getElementById(`player-btn-${x},${y}`).style.color = 'red';
  if (player.hitsRemaining == 0) {
    endGame();
    winnerContainer.classList.add('winner-declaration');
    return winnerText.textContent = "GOD JOB, IDIOT.  YOU'VE LOST and should probably go into a manic bulimic state for the next year";
  }
};

// filter duplicates for adjacentAttackPositions array
const filterDuplicates = (arr) => {
  const outputArray = [];

  let count = 0;
  let start = false;

  for (let j = 0; j < arr.length; j++) {
    for (let k = 0; k < outputArray.length; k++) {
      if (arr[j][0] == outputArray[k][0] && arr[j][1] == outputArray[k][1]) {
        start = true;
      }
    }
    count++;
    if (count == 1 && start == false) {
      outputArray.push(arr[j]);
    }
    start = false;
    count = 0;
  }
  return outputArray;
};

// Filter the positions in adjacentAttackPositions that have already been hit
const filterAlreadyHit = (arr) => arr.filter((pos) => player.board.getValue(pos[0], pos[1]) != 'HIT' && player.board.getValue(pos[0], pos[1]) != 'MISS');

// calculate attack provides valid coordinates for computer.sendAttack
// implemented this way to allow for separate assignation if there is
// an adjacent move present in the array adjacentAttackPositions
computer.calculateAttack = () => {
  let position;
  let index;
  if (!adjacentAttackPositions.length || adjacentAttackPositions.length == 0) {
    index = generateRandomNum(computerAttackPositions.length);
    position = computerAttackPositions.splice(index, 1);
    computerUsedAttacks.push(position);
    const extractedPosition = position[0];
    const [x, y] = extractedPosition;
    return computer.sendAttack(x, y);
  }

  position = adjacentAttackPositions.shift();
  index = computerAttackPositions.findIndex((item) => item[0] == position[0]
                                                      && item[1] == position[1]);
  computerUsedAttacks.push(computerAttackPositions.splice(index, 1));
  return computer.sendAttack(position[0], position[1]);
};

// create buttons to change horizontal and vertical placements

const horizontalBtn = document.getElementById('horizontal');
const verticalBtn = document.getElementById('vertical');
const horizontalLabel = document.getElementById('horizontal-label');
const verticalLabel = document.getElementById('vertical-label');

let playerHorizontalVerticalValue = 'horizontal';

horizontalBtn.addEventListener('click', () => {
  playerHorizontalVerticalValue = horizontalBtn.value;
});

verticalBtn.addEventListener('click', () => {
  playerHorizontalVerticalValue = verticalBtn.value;
});

// create board buttons
const playerBoard = document.getElementById('player-board');
const computerBoard = document.getElementById('computer-board');

const playerButtonValues = computerAttackPositions.slice();

const createPlayerButtons = (function () {
  for (let i = 0; i < playerButtonValues.length; i++) {
    const boardBtn = document.createElement('button');
    boardBtn.textContent = playerButtonValues[i];
    boardBtn.value = playerButtonValues[i];
    boardBtn.classList.add('board-btn', 'board-btn-player', 'board-btn-green');
    boardBtn.setAttribute('id', `player-btn-${playerButtonValues[i]}`);
    playerBoard.appendChild(boardBtn);
    boardBtn.onclick = function () {
      player.board.setShips(Number(this.value[0]), Number(this.value[2]), playerHorizontalVerticalValue);
      if (player.hitsRemaining == 17) {
        startGame();
      }
    };
  }
})();

// disable player buttons upon setting ships
const disablePlayerBtns = () => {
  const boardButtonsArr = document.querySelectorAll('.board-btn-player');
  boardButtonsArr.forEach((btn) => {
    btn.onclick = null;
    btn.classList.add('board-btn-dead');
    btn.classList.remove('board-btn-green');
  });
  horizontalLabel.style.display = 'none';
  verticalLabel.style.display = 'none';
};

const enableComputerBtns = () => {
  const boardButtonsArr = document.querySelectorAll('.board-btn-computer');
  //   console.log(boardButtonsArr);
  boardButtonsArr.forEach((btn) => {
    btn.classList.remove('board-btn-dead');
    btn.classList.add('board-btn-green');
    btn.onclick = function () {
      player.sendAttack([Number(this.value[0]), Number(this.value[2])]);

      if (computer.board.getValue(Number(this.value[0]), Number(this.value[2])) == 'HIT') {
        btn.style.backgroundColor = 'red';
        btn.style.color = 'red';
      }
      if (computer.board.getValue(Number(this.value[0]), Number(this.value[2])) == 'MISS') {
        btn.style.backgroundColor = 'none';
        btn.style.opacity = '0';
      }
    };
  });
};

const createComputerButtons = (function () {
  for (let i = 0; i < playerButtonValues.length; i++) {
    const boardBtn = document.createElement('button');
    boardBtn.textContent = playerButtonValues[i];
    boardBtn.value = playerButtonValues[i];
    boardBtn.classList.add('board-btn', 'board-btn-computer', 'board-btn-dead');
    boardBtn.setAttribute('id', `computer-btn-${playerButtonValues[i]}`);
    computerBoard.appendChild(boardBtn);
    boardBtn.onclick = null;
  }
})();

const startGame = () => {
  disablePlayerBtns();
  enableComputerBtns();
  // generate computer positions
  computer.board.setAllShips();
};

const disableAllBtns = () => {
  const allBoardBtns = document.querySelectorAll('.board-btn');
  allBoardBtns.forEach((btn) => {
    btn.onclick = null;
    btn.classList.remove('board-btn-green');
  });
};

const endGame = () => {
  disableAllBtns();
};

// Log buttons to view player and computer boards
const logPlayerBoardBtn = document.getElementById('log-player-board-btn');
logPlayerBoardBtn.onclick = function () {
  console.log(
    'player',
    player.board.board,
  );
};

const logComputerBoardBtn = document.getElementById('log-computer-board-btn');
logComputerBoardBtn.onclick = function () {
  console.log(
    'computer',
    computer.board.board,
  );
};
