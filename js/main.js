/* eslint-disable */
const gameboard = document.getElementById('gameboard');
const empty = 0;
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded!');
  // State of game
  const state = {
    board: [[empty, empty, empty, empty, empty],
            [empty, empty, empty, empty, empty],
            [empty, mountain, mountain, mountain, empty],
            [empty, empty, empty, empty, empty],
            [empty, empty, empty, empty, empty]],
    elephantPool: 5,
    rhinoPool: 5,
    turn: ELEPHANT, // 0 -> elephant, 1 -> rhino
    selected: NOTHING, // 0 -> nothing, [x,y] -> current selection
    clicked: NOTHING, // 0 -> nothing, [x,y] -> clicked coords
  };
  drawBoard(gameboard, state);
  gameboard.addEventListener('click', clickDelegation(state), false);
});

// drawBoard :: (elem, state) => void
const drawBoard = function (view, model) {
  model.board.forEach((row, y) => {
    row.forEach((space, x) => {
      if (model.board[y][x] === empty) {
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
    if (clickTarget.tagName === 'IMG') {
      clickTarget = clickTarget.parentNode;  
    }
    console.log(clickTarget);
    
    console.log('Clickable!!');
    gameboard.removeEventListener('click', handle);

    // get x,y coords from element clicked
    const x = Number.parseInt(clickTarget.id[1]);
    const y = Number.parseInt(clickTarget.id[2]);

    // If nothing selected
    if (!currentState.selection) {
      // check if current player's piece
      if (isYourPiece(currentState.turn, currentState.board[y][x])) {
        currentState.selection = [x, y];
        highlight(clickTarget);
        gameboard.addEventListener('click', clickDelegation(currentState));
      } else {
        gameboard.addEventListener('click', clickDelegation(state));
      }
    } else {
      currentState.clicked = [x, y];
      playerTurn(currentState);
    }
  };
  return handle;
};

// isYourPiece :: (Either[ELEPHANT | RHINO], Any) => Bool
const isYourPiece = function (currentPlayer, piece) {
  return (piece.toString().indexOf(currentPlayer) >= 0);
};

// playerTurn :: state => void
const playerTurn = function (state) {
  const currentState = Object.assign({}, state);
  // const x = currentState.selection[0];
  // const y = currentState.selection[1];
  // RANDOM MOVE TO TEST
  const x = 0;
  const y = 5;

  // console.log('playerTurn');
  // console.log(`(${coords.x},${coords.y})`)
  // console.log(state);

  let futureState = 0;

  // 5 is off-board
  if (y === 5) {
    // If you click your own pool
    if (x === currentState.turn) {
      // returns future[state]
      futureState = moveToBoard(currentState);
    }
  }

  // switch(true) {
  //   case (y >= 0)
  // }



  futureState.then((nextState) => {
    console.log('Valid Move');
    drawBoard(gameboard, nextState);
    gameboard.addEventListener('click', clickDelegation(nextState));
  }).catch((reason) => {
    console.log(reason);
    drawBoard(gameboard, currentState);
    gameboard.addEventListener('click', clickDelegation(currentState));
  });
};

// moveToBoard :: state => future[state]
const moveToBoard = function (state) {
  const currentState = Object.assign({}, state);
  const x = currentState.selection[0];
  const y = currentState.selection[1];

  const futureState = new Promise((resolve, reject) => {
    // Random update to test Promise
    const nextState = Object.assign({}, currentState);
    // for testing. will change to if Valid then resolve else reject
    let isValid = true;
    if (isValid) {
      nextState.board[0][0] = eleDown;
      setTimeout(resolve(nextState), 2000);
    } else {
      reject('Not valid move');
    }
  });
  // highlight outside squares
  // maybe add .valid class for next click event

  // make click event for outside squares
  return futureState;
};


// highlight :: elem => void
const highlight = function (element) {
  element.classList.add('highlight');
};

// highlightValid :: [board] => Int(action) => void

// clearHighlight :: () => void 
