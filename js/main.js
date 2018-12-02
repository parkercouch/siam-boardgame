/* eslint-disable */
const gameboard = document.getElementById('gameboard');
const EMPTY = 'empty';
// Temp names
const mountain = 'stone';
const eleUp = 'gol0-up';
const eleDown = 'gol0-down';
const eleLeft = 'gol0-left';
const eleRight = 'gol0-right';
const rhinoUp = 'gol1-up';
const rhinoDown = 'gol1-down';
const rhinoLeft = 'gol1-left';
const rhinoRight = 'gol1-right'; 
const ELEPHANT = 0;
const RHINO = 1;
const NOTHING = 0;
const POOL = 'p';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded!');
  // State of game
  const state = {
    // board[y][x]
    board: [[EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, mountain, mountain, mountain, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]],
    elephantPool: 5,
    rhinoPool: 5,
    turn: ELEPHANT, // 0 -> elephant, 1 -> rhino
    selected: NOTHING, // 0 -> nothing, [x,y] -> current selection
    targeted: NOTHING, // 0 -> nothing, [x,y] -> targeted coords
  };
  drawBoard(gameboard, state);
  gameboard.addEventListener('click', clickDelegation(state), false);
});

// drawBoard :: (elem, state) => void
const drawBoard = function (view, model) {
  model.board.forEach((row, y) => {
    row.forEach((space, x) => {
      if (model.board[y][x] === EMPTY) {
        view.querySelector(`#s${x}${y} img`).src = '';
      } else {
        view.querySelector(`#s${x}${y} img`).src = `img/${model.board[y][x]}.png`;
      }
    });
  });
}


// When clicked
// clickDelegation :: state => (evt) => void
const clickDelegation = (state) => {
  const handle = (evt) => {
    const currentState = Object.assign({}, state);
    console.log('clicked!')
    // console.log(currentState);
    // Bail if nothing valid is clicked
    if (!evt.target.matches('.clickable')) return;
    evt.preventDefault();
    let clickTarget = evt.target;
    // UPDATE!! will need to change depending on html formatting
    if (clickTarget.tagName === 'IMG') {
      clickTarget = clickTarget.parentNode;  
    }
    console.log(clickTarget);
    
    console.log('Clickable!!');
    gameboard.removeEventListener('click', handle);

    // get x,y coords from element clicked
    const x = Number.parseInt(clickTarget.id[1]);
    const y = Number.parseInt(clickTarget.id[2]);
    console.log(`clicktarget: (${x},${y})`);
    // NEED to add check if pool has contents
    const inPool = clickTarget.id[0] === POOL && x === currentState.turn;

    // If nothing selected
    if (!currentState.selected) {
      // check if current player's piece or pool
      if (inPool || isYourPiece(currentState.turn, currentState.board[y][x])) {
        currentState.selected = [x, y];
        highlight(clickTarget);
        gameboard.addEventListener('click', clickDelegation(currentState));
      } else {
        gameboard.addEventListener('click', clickDelegation(state));
      }
    } 
    // If already selected then do an action at targeted
    else {
      // Check if targeted and selected are pool and reject UPDATE ME
      currentState.targeted = [x, y];
      playerTurn(currentState);
    }
  };
  return handle;
};

// isYourPiece :: (Either[ELEPHANT | RHINO], Any) => Bool
const isYourPiece = function (currentPlayer, piece) {
  console.log(`piece: ${piece}`);
  return (piece.toString().indexOf(currentPlayer) >= 0);
};

// playerTurn :: state => void
const playerTurn = function (state) {
  const currentState = Object.assign({}, state);
  // RANDOM MOVE TO TEST
  // const x = 0;
  // const y = 5;


  const selectedCoords = {
    x : Number.parseInt(currentState.selected[0]),
    y : Number.parseInt(currentState.selected[1]),
  };
  const targetedCoords = {
    x : Number.parseInt(currentState.targeted[0]),
    y : Number.parseInt(currentState.targeted[1]),
  };
  console.log(currentState);
  console.log(currentState.board);
  console.log(currentState.board[0][0]);

  let selectedPiece;

  if (selectedCoords.y === 5) {
    selectedPiece = POOL;
  } else {
    selectedPiece = currentState.board[selectedCoords.y][selectedCoords.x];
  }

  const targetLocation = currentState.board[targetedCoords.y][targetedCoords.x];

  // console.log('playerTurn');
  // console.log(`(${coords.x},${coords.y})`)
  // console.log(state);

  let futureState = 0;

  //----------- ACTION! -----------//
  
  // 5 is off-board
  if (selectedPiece === POOL) {
    if (targetLocation === EMPTY) {
     futureState = moveToBoard(currentState); 
    } else {
      futureState = pushFromSide(currentState);
    }
  } else {
    switch (true) {
      // 5 is off board
      case (targetedCoords.y === 5):
        futureState = removeFromBoard(currentState);
        break;
      case (targetLocation === EMPTY):
        futureState = movePiece(currentState);
        break;
      case (targetLocation === selectedPiece):
        futureState = rotate(currentState);
        break;
      case (targetLocation !== EMPTY):
        futureState = initiatePush(currentState);
        break;
      default:
        futureState = new Promise((resolve, reject) => {reject('Not valid')});
    }
  }


  //NEED TO ADD RESET TO HIGHLIGHTING AND UPDATE TURN
  futureState.then((nextState) => {
    console.log('Valid Move');
    drawBoard(gameboard, nextState);
    gameboard.addEventListener('click', clickDelegation(nextState));
  }).catch((reason) => {
    console.log(reason);
    currentState.targeted = 0;
    drawBoard(gameboard, currentState);
    gameboard.addEventListener('click', clickDelegation(currentState));
  });
};

// moveToBoard :: state => future[state]
const moveToBoard = function (state) {
  const currentState = Object.assign({}, state);
  const x = currentState.targeted[0];
  const y = currentState.targeted[1];

  const futureState = new Promise((resolve, reject) => {
    //Do I need a nextState?? **UPDATE**
    const nextState = Object.assign({}, currentState);
    if (isOnBorder([x, y])) {
      nextState.board[y][x] = eleDown;
      resolve(nextState);
    } else {
      reject('Not valid move');
    }
  });
  return futureState;
};

// isOnBorder :: [x,y] => Bool
const isOnBorder = function (coords) {
  // Can probably re-write with array functions
  if (coords[0] === 0 || coords[1] === 0 ||
      coords[0] === 4 || coords[1] === 4) {
    return true;
  }
  return false;
};

// pushFromSide :: state => future[state]
const pushFromSide = function (state) {
  return new Promise((resolve, reject) => {reject('pushFromSide not ready yet.')});
};

// removeFromBoard :: state => future[state]
const removeFromBoard = function (state) {
  return new Promise((resolve, reject) => {reject('removeFromBoard not ready yet.')});
};

// movePiece :: state => future[state]
const movePiece = function (state) {
  return new Promise((resolve, reject) => {reject('movePiece not ready yet.')});
};

// rotate :: state => future[state]
const rotate = function (state) {
  return new Promise((resolve, reject) => {reject('rotate not ready yet.')});
};

// initiatePush :: state => future[state]
const initiatePush = function (state) {
  return new Promise((resolve, reject) => {reject('initiatePush not ready yet.')});
};

// highlight :: elem => void
const highlight = function (element) {
  element.classList.add('highlight');
};

// highlightValid :: [board] => Int(action) => void

// clearHighlight :: () => void 
