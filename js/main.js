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
const ELE = 'gol0-';
const RHI = 'gol1-';
const UP = 'up';
const DOWN = 'down';
const LEFT = 'left';
const RIGHT = 'right';

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


// When clicked
// clickDelegation :: state -> (evt) -> void
const clickDelegation = (state) => {
  const handle = (evt) => {
    const currentState = Object.assign({}, state);
    console.log('clicked!')

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
    // Remove listener while we have reference to handle
    gameboard.removeEventListener('click', handle);

    // get x,y coords from element clicked
    const x = Number.parseInt(clickTarget.id[1]);
    const y = Number.parseInt(clickTarget.id[2]);
    console.log(`clicktarget: (${x},${y})`);
    // NEED to add check if pool has contents

    // 1 -> rhino, 0 -> elephant
    const currentPool = (currentState.turn) ? currentState.rhinoPool
                                            : currentState.elephantPool;

    // Player can click the pool if it is theirs and it has a piece
    const inPool = clickTarget.id[0] === POOL
                && x === currentState.turn
                && currentPool > 0;

    // If nothing selected
    if (!currentState.selected) {

      // check if current player's piece or pool
      if (inPool ||
          (y < 5 && isYourPiece(currentState.turn, currentState.board[y][x]))) {
        currentState.selected = [x, y];
        highlight(clickTarget);
        gameboard.addEventListener('click', clickDelegation(currentState));
      } else {
        gameboard.addEventListener('click', clickDelegation(state));
      }
    } 
    // If selected and targeted are both the Pool then try again!
    else if (currentState.selected[1] === 5
             && y === 5) {
      gameboard.addEventListener('click', clickDelegation(state));
    }
    // If already selected then do an action at targeted
    else {
      currentState.targeted = [x, y];
      playerTurn(currentState);
    }
  };
  return handle;
};

// playerTurn :: state -> void
const playerTurn = function (state) {
  const currentState = Object.assign({}, state);

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

  // set selected and targeted to Pool or square
  const selectedPiece = (selectedCoords.y === 5) ?
                        POOL : currentState.board[selectedCoords.y][selectedCoords.x];
  const targetLocation = (targetedCoords.y === 5) ?
                        POOL : currentState.board[targetedCoords.y][targetedCoords.x];


  let futureState = 0;

  //----------- ACTION! -----------//
  
  if (selectedPiece === POOL) {
    if (targetLocation === EMPTY) {
     futureState = moveToBoard(currentState); 
    } else {
      futureState = pushFromSide(currentState);
    }
  } else {
    switch (true) {
      case (targetLocation === POOL):
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


  futureState.then((nextState) => {
    console.log('Valid Move');
    drawBoard(gameboard, nextState);
    // Toggle between 0 and 1 for turn: +(to number) !!(to bool) !(not)
    nextState.turn = +!!!nextState.turn;
    removeHighlight(getSelectedSquare(nextState.selected));
    removeSelected(nextState);
    gameboard.addEventListener('click', clickDelegation(nextState));
  }).catch((reason) => {
    console.log(reason);
    currentState.targeted = 0;
    drawBoard(gameboard, currentState);
    gameboard.addEventListener('click', clickDelegation(currentState));
  });
};

// moveToBoard :: state -> future[state]
const moveToBoard = function (state) {
  const currentState = Object.assign({}, state);
  const x = currentState.targeted[0];
  const y = currentState.targeted[1];
  const currentPool = currentState.turn ? 'rhinoPool' : 'elephantPool';

  const futureState = new Promise((resolve, reject) => {
    //Do I need a nextState?? **UPDATE**
    const nextState = Object.assign({}, currentState);
    if (isOnBorder([x, y])) {
      // Place piece depending on player turn
      const piece = moveToBoardPiece(nextState);
      nextState.board[y][x] = piece;
      nextState[currentPool] -= 1;
      drawBoard(gameboard, nextState);
      
      resolve(nextState);
    } else {
      reject('Not valid move');
    }
  });
  return futureState;
};

// moveToBoardPiece :: state -> String 
const moveToBoardPiece = function (state) {
  // Select piece and direction when moving from pool to board
  const x = state.targeted[0];
  const y = state.targeted[1];
  const player = state.turn;
  let piece = player ? RHI : ELE;

  switch (true) {
    case (y == 0):
      piece += DOWN;
      break;
    case (y == 4):
      piece += UP;
      break;
    case (x == 0):
      piece += RIGHT;
      break;
    case (x == 4):
      piece += LEFT;
      break;
    default:
      piece = 'ERROR';
  }

  return piece;
};



// pushFromSide :: state -> future[state]
const pushFromSide = function (state) {
  return new Promise((resolve, reject) => {reject('pushFromSide not ready yet.')});
};

// removeFromBoard :: state -> future[state]
const removeFromBoard = function (state) {
  return new Promise((resolve, reject) => {reject('removeFromBoard not ready yet.')});
};

// movePiece :: state -> future[state]
const movePiece = function (state) {
  return new Promise((resolve, reject) => {reject('movePiece not ready yet.')});
};

// rotate :: state -> future[state]
const rotate = function (state) {
  const currentState = Object.assign({}, state);
  showArrows(getSelectedSquare(currentState.targeted));
  
  return new Promise((resolve, reject) => {
    reject('rotate not ready yet.')
  });
};

// initiatePush :: state -> future[state]
const initiatePush = function (state) {
  return new Promise((resolve, reject) => {reject('initiatePush not ready yet.')});
};





// ------------------------------------------------- //
// ------------ HELPER FUNCTIONS ------------------- //
// ------------------------------------------------- //

// drawBoard :: (elem, state) -> void
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
  view.querySelector('#elephants').textContent = model.elephantPool;
  view.querySelector('#rhinos').textContent = model.rhinoPool;
};

// isYourPiece :: (Either[ELEPHANT | RHINO], Any) -> Bool
const isYourPiece = function (currentPlayer, piece) {
  console.log(`piece: ${piece}`);
  return (piece.toString().indexOf(currentPlayer) >= 0);
};

// isOnBorder :: [x,y] -> Bool
const isOnBorder = function (coords) {
  // Can probably re-write with array functions
  if (coords[0] === 0 || coords[1] === 0 ||
      coords[0] === 4 || coords[1] === 4) {
    return true;
  }
  return false;
};

// getSelectedSquare :: [x,y] -> elem
const getSelectedSquare = function (coords) {
  const x = coords[0];
  const y = coords[1];

  // If it is off the board (aka pool)
  if (y === 5) {
    return document.getElementById(`p${x}${y}`)
  } else {
    return document.getElementById(`s${x}${y}`);
  }
};

// showArrows :: elem -> void
const showArrows = function(square) {
  const upArrow = document.createElement('img');
  const downArrow = document.createElement('img');
  const leftArrow = document.createElement('img');
  const rightArrow = document.createElement('img');
  upArrow.classList.add('clickable', 'arrow', 'up');
  downArrow.classList.add('clickable', 'arrow', 'down');
  leftArrow.classList.add('clickable', 'arrow', 'left');
  rightArrow.classList.add('clickable', 'arrow', 'right');
  upArrow.setAttribute('src', 'img/arrow-up.png');
  downArrow.setAttribute('src', 'img/arrow-down.png');
  leftArrow.setAttribute('src', 'img/arrow-left.png');
  rightArrow.setAttribute('src', 'img/arrow-right.png');
  square.classList.add('arrow-container');
  square.appendChild(upArrow);
  square.appendChild(leftArrow);
  square.appendChild(rightArrow);
  square.appendChild(downArrow);
};

// hideArrows :: elem -> void
const hideArrows = function(square) {
  const contents = [...square.children];
  contents.forEach((child) => {
    if (child.classList.contains('arrow')) {
     child.remove();
    }
  });
  square.classList.remove('arrow-container');
};

// highlight :: elem -> void
const highlight = function (toHighlight) {
  toHighlight.classList.add('highlight');
};

// highlightValid :: [board] -> Int(action) -> void

// removeHighlight :: elem -> void 
const removeHighlight = function (highlighted) {
  highlighted.classList.remove('highlight');
};

// **Modifies state without copy**
// removeSelected :: state -> void
const removeSelected = function (state) {
  state.selected = 0;
  state.targeted = 0;
}

