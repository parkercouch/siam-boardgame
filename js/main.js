/* eslint-disable */
const gameboard = document.getElementById('gameboard');
const empty = 0;
const mountain = 9;
const eleUp = 1;
const eleDown = 2;
const eleLeft = 3;
const eleRight = 4;
const rhinoUp = 5;
const rhinoDown = 6;
const rhinoLeft = 7;
const rhinoRight = 8; 

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded!');
  
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



// When clicked

const clickDelegation = (currentState) => {

  return (evt) => {
    console.log('in clickDelegation')
    console.log(currentState);
    // Bail if nothing valid is clicked
    if (!evt.target.matches('.clickable')) return;
    evt.preventDefault();
    console.log(evt.target);
    // get x,y coords from element clicked
    const x = Number.parseInt(evt.target.id[0]);
    const y = Number.parseInt(evt.target.id[1]);


    playerTurn(x, y, currentState);
  };
};

const playerTurn = function (x, y, state) {
  console.log('playerTurn');
  console.log(`(${x},${y})`)
  console.log(state);
};


