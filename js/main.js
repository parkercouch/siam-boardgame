/* eslint-disable */
const gameboard = document.getElementById('gameboard');
const empty = 0;
// Temp names
const mountain = 'stone';
const eleUp = 'gol-up';
const eleDown = 'gol-down';
const eleLeft = 'gol-left';
const eleRight = 'gol-right';
const rhinoUp = 'gol2-up';
const rhinoDown = 'gol2-down';
const rhinoLeft = 'gol2-left';
const rhinoRight = 'gol2-right'; 
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
  };
  drawBoard(gameboard, state);
  gameboard.addEventListener('click', clickDelegation(state), false);
});


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
    const coords = {
      x: Number.parseInt(clickTarget.id[1]),
      y: Number.parseInt(clickTarget.id[2]),
    };
    currentState.selection = [Number.parseInt(clickTarget.id[1]),
                              Number.parseInt(clickTarget.id)[2]];

    playerTurn(currentState);
  };
  return handle;
};

// playerTurn :: {state} => void
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

  // For testing purposes only
  // currentState.board[coords.y][coords.x] = eleDown;
  // drawBoard(gameboard, currentState);
  // gameboard.addEventListener('click', clickDelegation(currentState));


  let futureState = 0;

  // 5 is off-board
  if (y === 5) {
    // If you click your own pool
    if (x === currentState.turn) {
      // returns future[state]
      futureState = moveToBoard(currentState);
    }
  }

  futureState.then((nextState) => {
    console.log('Valid Move');
    drawBoard(gameboard, nextState);
    gameboard.addEventListener('click', clickDelegation(nextState));
  }).catch((reason) => {
    console.log(reason);
    drawBoard(gameboard, currentState);
    gameboard.addEventListener('click', clickDelegation(currentState));
  });


  // // Update Promise resolve/fail
  // if (nextState === 0 ) {
  //   gameboard.addEventListener('click', clickDelegation(currentState));
  // }
  // // For testing. Will return data from move functions to pass to next event
  // // nextState = Object.assign({}, currentState);
  // drawBoard(gameboard, nextState);
  // gameboard.addEventListener('click', clickDelegation(nextState));

};

// moveToBoard :: {state} => future[{state} | 0]
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

// highlightValid :: [board] => Int(action) => void

// clearHighlight :: () => void 
