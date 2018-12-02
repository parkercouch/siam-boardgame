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

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded!');
  drawBoard(gameboard, state);
  
  gameboard.addEventListener('click', clickDelegation(state), false);
});

// State of game
const state = {
  board: [[empty, empty, empty, empty, empty],
          [empty, empty, empty, empty, empty],
          [empty, mountain, mountain, mountain, empty],
          [empty, empty, empty, empty, empty],
          [empty, empty, empty, empty, empty]],
  elephantPool: 5,
  rhinoPool: 5,
  turn: 0, // 0 -> elephant, 1 -> rhino
};

const drawBoard = function (view, model) {
  // y coords
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

const clickDelegation = (currentState) => {
  const handle = (evt) => {
    console.log('clicked!')
    // console.log(currentState);
    // Bail if nothing valid is clicked
    if (!evt.target.matches('.clickable')) return;
    evt.preventDefault();
    let clickTarget = evt.target;
    if (evt.target.tagName === 'IMG') {
      clickTarget = evt.target.parentNode;  
    }
    console.log(clickTarget);
    
    console.log('Clickable!!');
    gameboard.removeEventListener('click', handle);

    // get x,y coords from element clicked
    const coords = {
      x: Number.parseInt(clickTarget.id[1]),
      y: Number.parseInt(clickTarget.id[2]),
    };

    playerTurn(coords, currentState);
  };
  return handle;
};

const playerTurn = function (coords, state) {
  // console.log('playerTurn');
  // console.log(`(${coords.x},${coords.y})`)
  // console.log(state);


  const currentState = Object.assign({}, state);
  
  // For testing purposes only
  currentState.board[coords.y][coords.x] = eleDown;
  drawBoard(gameboard, currentState);

  gameboard.addEventListener('click', clickDelegation(currentState));
};


