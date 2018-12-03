/* eslint-disable */
const gameboard = document.getElementById('gameboard');
const EMPTY = 'empty';
// Temp names
const mountain = 'mtn3-neutral';
const eleUp = 'gol0-up';
const eleDown = 'gol0-down';
const eleLeft = 'gol0-left';
const eleRight = 'gol0-right';
const eleNeutral = 'gol0-neutral';
const rhinoUp = 'gol1-up';
const rhinoDown = 'gol1-down';
const rhinoLeft = 'gol1-left';
const rhinoRight = 'gol1-right'; 
const rhinoNeutral = 'gol1-neutral';
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
const NEUTRAL = 'neutral';

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
      case (targetLocation === mountain):
        futureState = initiatePush(currentState);
        break;
      case (targetLocation === EMPTY):
        futureState = movePiece(currentState);
        break;
      case (targetedCoords.x === selectedCoords.x
          && targetedCoords.y === targetedCoords.y):
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
    removeArrows(getSelectedSquare(nextState.targeted));
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

  return new Promise((resolve, reject) => {
    if (isOnBorder([x, y])) {
      // Place piece depending on player turn
      const piece = moveToBoardPiece(currentState);
      currentState.board[y][x] = piece;
      currentState[currentPool] -= 1;
      drawBoard(gameboard, currentState);

      const rotateHandler = () => {

        const futureState = rotate(currentState);

        futureState.then((nextState) => {
          console.log('Placed on board and rotated');
          resolve(nextState);
        }).catch((reason) => {
          console.log(reason);
          removeArrows(getSelectedSquare(currentState.targeted));
          rotateHandler();
        });
      };
      rotateHandler();
    } else {
      reject('Not valid move');
    }
  });
};

// HOW TO IMPLEMENT CORNER CASES? ARROWS POP UP?
// WHAT IF PUSHING ISN'T POSSIBLE? CHECK BOTH DIRECTIONS
// FIRST THEN ALLOW SO WE DON'T GET STUCK?
// pushFromSide :: state -> future[state]
const pushFromSide = function (state) {
  return new Promise((resolve, reject) => {reject('pushFromSide not ready yet.')});
};

// removeFromBoard :: state -> future[state]
const removeFromBoard = function (state) {
  const currentState = Object.assign({}, state);
  const x = currentState.selected[0];
  const y = currentState.selected[1];
  const currentPool = currentState.turn ? 'rhinoPool' : 'elephantPool';

  return new Promise((resolve, reject) => {
    if (isOnBorder([x, y])) {
      currentState[currentPool] += 1;
      currentState.board[y][x] = EMPTY;
      resolve(currentState);
    } else {
      reject('Piece not on border');
    }
  });
};

// movePiece :: state -> future[state]
const movePiece = function (state) {
  const currentState = Object.assign({}, state);
  const xt = currentState.targeted[0];
  const yt = currentState.targeted[1];
  const xs = currentState.selected[0];
  const ys = currentState.selected[1];
  const targetSquare = currentState.board[yt][xt];

  return new Promise((resolve, reject) => {
    if (targetSquare === EMPTY) {
      const piece = currentState.board[ys][xs].slice(0,5) + NEUTRAL;
      currentState.board[yt][xt] = piece;
      currentState.board[ys][xs] = EMPTY;
      drawBoard(gameboard, currentState);

      const rotateHandler = () => {

        const futureState = rotate(currentState);

        futureState.then((nextState) => {
          console.log('Now Rotate!');
          resolve(nextState);
        }).catch((reason) => {
          console.log(reason);
          removeArrows(getSelectedSquare(currentState.targeted));
          rotateHandler();
        });
      };
      rotateHandler();
    } else {
      // Flag not valid until push function is made
      reject('Not valid move');
    }
  });
};

// rotate :: state -> future[state]
const rotate = function (state) {
  const currentState = Object.assign({}, state);
  showArrows(getSelectedSquare(currentState.targeted));
  
  return new Promise((resolve, reject) => {
    const clickArrow = (currentState) => {
      const nextState = Object.assign({}, currentState);
      const handle = (evt) => {
        // remove listener while handle is in scope
        gameboard.removeEventListener('click', handle);
        // Get current target and slice last half to get direction
        const curTarget = nextState.targeted;
        const currentDirection = nextState.board[curTarget[1]][curTarget[0]].slice(5);
        const arrowClasses = [...evt.target.classList];
        let newDirection;

        switch (true) {
          case (arrowClasses.includes('up')):
            if (currentDirection === 'up') {
              reject('Already facing that way');
            }
            newDirection = UP;
            break;
          case (arrowClasses.includes('down')):
            if (currentDirection === 'down') {
              reject('Already facing that way');
            }
            newDirection = DOWN;
            break;
          case (arrowClasses.includes('left')):
            if (currentDirection === 'left') {
              reject('Already facing that way');
            }
            newDirection = LEFT;
            break;
          case (arrowClasses.includes('right')):
            if (currentDirection === 'right') {
              reject('Already facing that way');
            }
            newDirection = RIGHT;
            break;
          default:
            reject('Not a valid direction');
            return;
        }

        // Update direction and resolve
        nextState.board[curTarget[1]][curTarget[0]] = nextState
                .board[curTarget[1]][curTarget[0]].slice(0,5) + newDirection;

        resolve(nextState);
      };
      return handle;
    };
    gameboard.addEventListener('click', clickArrow(currentState));
  });
};

// initiatePush :: state -> future[state]
const initiatePush = function (state) {
  const currentState = Object.assign({}, state);

  return new Promise((resolve, reject) => {
    if (inFront(currentState)) {
      // reject('not ready yet!');
      console.log('Facing Forward')
      console.log(currentState);
      const pusher = currentState.board[currentState.selected[1]][currentState.selected[0]];

      console.log(pusher);
      const rowInFront = getRowInFront(currentState);
      
      // [map] check directions of pieces
      const pushedRow = rowInFront.map((pieceName) => { pieceName.slice(5); });

      // [map] assign push strength values 
      // [reduce] sum
      const pushAmount = 1 + assignPushStrength(pushedRow, pusher).reduce((a,b) => a + b);
      console.log(pushAmount);

      // Get x,y coords of pushed elements
      const coordsOfRow = getCoordsInFront(currentState);

      // If able to push, then move all pieces 1 then resolve
      if (pushAmount > 0) {
        resolve(pushRow(coordsOfRow, currentState));
      } else {
        reject('Not strong enough');
      }

      


    } else {
      reject('Can\'t push');
    }
  });
};

// pushRow :: ([[x,y]], state) -> state
const pushRow = function (coords, state) {
  console.log('PUSHING!');
  const currentState = Object.assign({}, state);

  const direction = currentState.board[currentState.selected[1]][currentState.selected[0]].slice(5);

  switch (direction) {
    case UP:
    case DOWN:
    case LEFT:
    case RIGHT:
    default:
  }




  return state;
};

// getRowInFront :: state -> [string]
const getRowInFront = function (state) {
  const pusher = state.board[state.selected[1]][state.selected[0]];
  const direction = pusher.slice(5);
  const xp = state.selected[0];
  const yp = state.selected[1];
  let pushedRow = [];

  switch (direction) {
    case UP:
      state.board.forEach((row, yb) => {
        return row.forEach((square, xb) => {
          if (xb === xp) {
            if (yb >= yp) {
              return;
            } else {
              pushedRow.unshift(square);
            }
          }
        });
      });
      break
    case DOWN:
      state.board.forEach((row, yb) => {
        row.forEach((square, xb) => {
          if (xb === xp) {
            if (yb !== yp) {
              pushedRow.push(square);
            }
          }
        });
      });
      break
    case LEFT:
      pushedRow = state.board[yp].slice(0, xp).reverse();
      break
    case RIGHT:
      pushedRow = state.board[yp].slice(xp + 1);
      break
    default:
      pushedRow = [];
      return;
  }

  if (pushedRow.includes(EMPTY)) {
    pushedRow = pushedRow.slice(0, pushedRow.indexOf(EMPTY));
  }
  return pushedRow;
};

// getCoordsInFront :: state -> [[x,y]]
const getCoordsInFront = function (state) {
  const pusher = state.board[state.selected[1]][state.selected[0]];
  const direction = pusher.slice(5);
  const xp = state.selected[0];
  const yp = state.selected[1];
  let pushedRow = [];

  switch (direction) {
    case UP:
      state.board.forEach((row, yb) => {
        return row.forEach((square, xb) => {
          if (xb === xp) {
            if (yb >= yp) {
              return;
            } else {
              pushedRow.unshift([xb, yb]);
            }
          }
        });
      });
      break
    case DOWN:
      state.board.forEach((row, yb) => {
        row.forEach((square, xb) => {
          if (xb === xp) {
            if (yb !== yp) {
              pushedRow.push([xb, yb]);
            }
          }
        });
      });
      break
    case LEFT:
      state.board[yp].forEach((square, xb) => {
        if (xb >= xy) {
          return;
        }
        if (square === EMPTY) {
          pushedRow.unshift(EMPTY);
        } else {
          pushedRow.unshift([xb, yb]);
        }
      });
      break
    case RIGHT:
      state.board[yp].forEach((square, xb) => {
        if (xb <= xp) {
          return;
        }
        if (square === EMPTY) {
          pushedRow.push(EMPTY);
        } else {
          pushedRow.push([xb, yb]);
        }
      });
      pushedRow = tate.board[yp].slice(xp + 1);
      break
    default:
      pushedRow = [];
      return;
  }

  if (pushedRow.includes(EMPTY)) {
    pushedRow = pushedRow.slice(0, pushedRow.indexOf(EMPTY));
  }
  return pushedRow;
};


// assignPushStrength :: [string], string -> [Float]
// same direction -> +1, opposite direction -> -1
// other directions -> 0, rocks -> 0.5
const assignPushStrength = function (pieces, pusher) {
  let opposite;
  switch (pusher) {
    case UP:
      opposite = DOWN;
    case DOWN:
      opposite = UP;
    case LEFT:
      opposite = RIGHT;
    case RIGHT:
      opposite = LEFT;
    default:
      opposite = NEUTRAL;
  }

  return pieces.map((direction) => {
    switch (true) {
      case (direction === pusher):
        return +1;
      case (direction === opposite):
        return (-1);
      case (direction === NEUTRAL):
        return (0.5);
      default:
        return 0;
    }
  })
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
const removeArrows = function(square) {
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

// moveToBoardPiece :: state -> String 
const moveToBoardPiece = function (state) {
  // Select piece and direction when moving from pool to board
  const x = state.targeted[0];
  const y = state.targeted[1];
  const player = state.turn;
  let piece = player ? RHI : ELE;
  return piece + NEUTRAL;
};

// inFront :: state -> Bool
const inFront = function (state) {
  const direction = state.board[state.selected[1]][state.selected[0]].slice(5);
  let xs = state.selected[0];
  let ys = state.selected[1];
  const xt = state.targeted[0];
  const yt = state.targeted[1];

  switch (direction) {
    case UP:
      ys -= 1;
      break;
    case DOWN:
      ys += 1;
      break;
    case LEFT:
      xs -= 1;
      break;
    case RIGHT:
      xs += 1;
      break;
    default:
    return false;
  }

   return (xs === xt && ys === yt) ? true : false;
};
