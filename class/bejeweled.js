const Screen = require("./screen");
const Cursor = require("./cursor");

class Bejeweled {

  constructor() {

    this.playerTurn = "O";

    // Initialize this
    this.grid = [];

    this.cursor = new Cursor(8, 8);

    Screen.initialize(8, 8);
    Screen.setGridlines(false);

    // Add commands
    Screen.addCommand('left', 'move cursor left', this.cursor.left.bind(this.cursor));
    Screen.addCommand('right', 'move cursor right', this.cursor.right.bind(this.cursor));
    Screen.addCommand('up', 'move cursor up', this.cursor.up.bind(this.cursor));
    Screen.addCommand('down', 'move cursor down', this.cursor.down.bind(this.cursor));
    Screen.addCommand('return', 'select fruit to swap', this.cursor.select.bind(this.cursor));
    Screen.addCommand('space', 'execute swap of selected fruit with current fruit', this.swap.bind(this));


    this.cursor.setBackgroundColor();
    Bejeweled.setBoard(this.grid, this.cursor);
  }

  static setBoard(grid, cursor) {
    const symbols = ['🍊','🥝', '🍇', '🍓', '🥥', '🍋'];

    for (let r = 0; r < cursor.numRows; r++) {
      let row = [];

      for (let c = 0; c < cursor.numCols; c++) {
        let el = Bejeweled.randomElement(symbols);
        row.push(el);
        Screen.setGrid(r, c, el);
      }

      grid.push(row);
    }

    Screen.render();

    // Clear matches if present on board setting
    let matches = Bejeweled.checkForMatches(grid);

    while (matches.length > 0) {
      Bejeweled.clearMatches(grid);

      matches = Bejeweled.checkForMatches(grid);
    }

    setTimeout(Screen.render, 250);
  }

  static randomElement(array) {
    const min = Math.ceil(0);
    const max = Math.floor(array.length);
    const random = Math.floor(Math.random() * (max - min) + min);

    return array[random];
  }

  swap() {
    // Check if there is a selected cell
    if (this.cursor.selRow !== null) {

      const selected = this.grid[this.cursor.selRow][this.cursor.selCol];
      const toSwap = this.grid[this.cursor.row][this.cursor.col];
      const swappable = Bejeweled.checkSwap(this.grid, this.cursor, selected, toSwap);

      // Execute valid swap
      if (swappable) {
        // change selected cell to swap element
        this.grid[this.cursor.row][this.cursor.col] = selected;
        Screen.setGrid(this.cursor.row, this.cursor.col, selected);

        // change swap cell to selected element
        this.grid[this.cursor.selRow][this.cursor.selCol] = toSwap;
        Screen.setGrid(this.cursor.selRow, this.cursor.selCol, toSwap);

        // clear selection
        Screen.setBackgroundColor(this.cursor.selRow, this.cursor.selCol, this.cursor.gridColor);
        this.cursor.selRow = null;
        this.cursor.selCol = null;
        this.cursor.selId = null;

        // clear matches
        Bejeweled.clearMatches(this.grid);
        setTimeout(Screen.render, 1000);

        // check for swap combos and execute
        let combos = Bejeweled.swapCombos(this.grid);

        // do until all combos are cleared
        while (combos.length > 0) {
          Bejeweled.clearMatches(this.grid);
          setTimeout(Screen.render, 1000);

          combos = Bejeweled.swapCombos(this.grid);
        }

        // check if there are still possible moves left
        const moves = Bejeweled.getValidMoves(this.grid);

        if (moves.length <= 0) {
          console.log('No more possible moves');
          setTimeout(Screen.quit, 1500);
        } else {
          console.log('Good move. Play on!');
          Screen.printCommands();
        }

      } else {
        // clear selection
        Screen.setBackgroundColor(this.cursor.selRow, this.cursor.selCol, this.cursor.gridColor);
        this.cursor.selRow = null;
        this.cursor.selCol = null;
        this.cursor.selId = null;

        console.log('That is not a valid swap. Try again!');
        Screen.printCommands();
      }

    } else {
      console.log('You must select a fruit before swapping!');
      Screen.printCommands();
    }

  }

  static checkSwap(grid, cursor, selected, toSwap) {
    let swappable;

    // switch elements
    grid[cursor.row][cursor.col] = selected;
    grid[cursor.selRow][cursor.selCol] = toSwap;

    // check for matches
    const matches = Bejeweled.checkForMatches(grid);

    // if match present, swap is vaild
    if (matches.length > 0) {
      swappable = true;
      return swappable;
    } else {
      // reset grid to unchecked state
      grid[cursor.row][cursor.col] = toSwap;
      grid[cursor.selRow][cursor.selCol] = selected;
    }

  }

  static swapCombos(grid) {
    return Bejeweled.checkForMatches(grid);
  }

  static clearMatches(grid) {
    const matches = Bejeweled.checkForMatches(grid);

    if (matches.length > 0) {

      matches.forEach(match => {

        if (match.row !== undefined) {
          grid[match.row][match.col1] = " ";
          grid[match.row][match.col2] = " ";
          grid[match.row][match.col3] = " ";
        } else {
          grid[match.row1][match.col] = " ";
          grid[match.row2][match.col] = " ";
          grid[match.row3][match.col] = " ";
        }

      });

      // Fill empty slots
      let droppable = Bejeweled.checkDropability(grid);

      while (!!droppable) {
        Bejeweled.dropFruits(grid);
        droppable = Bejeweled.checkDropability(grid);
      }

      Bejeweled.fillFruits(grid);

      // Set grid on screen
      grid.forEach((row, idx) => {
        row.forEach((el, i) => {
          Screen.setGrid(idx, i, el);
        })
      })

    }
  }

  static checkDropability(grid) {

    return grid.find((row, idx) => {
      let unfull = row.find((el, i) => {
        let belowEl;

        if (idx < grid.length - 1) {
          belowEl = grid[idx + 1][i];
        }

        return el !== " " && belowEl === " ";
      });

      return unfull !== undefined;
    });
  }

  static dropFruits(grid) {

    for (let r = 0; r < grid.length - 1; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        let el = grid[r][c];
        let belowEl = grid[r + 1][c];

        if (el !== " " && belowEl === " ") {
          grid[r + 1][c] = el;
          grid[r][c] = belowEl;
        }
      }
    }

  }

  static fillFruits(grid) {

    const symbols = ['🍊','🥝', '🍇', '🍓', '🥥', '🍋'];
    // Starting from the bottom
    // Check if present if not randomly generate and continue till grid is refilled
    for (let r = grid.length - 1; r >= 0; r--) {
      for (let c = 0; c < grid[0].length; c++) {
        let el = grid[r][c];

        if (el === " ") {
          grid[r][c] = Bejeweled.randomElement(symbols);
        }
      }
    }

  }


  static checkForMatches(grid) {
    // Fill this in
    const matches = [];

    const horizontals = Bejeweled.getHorizontalMatches(grid);
    const verticals = Bejeweled.getVerticalMatches(grid);

    matches.push(...horizontals, ...verticals)

    return matches;
  }

  static getValidMoves(grid) {
    const moves = [];

    const horizontals = Bejeweled.getHorizontalMoves(grid);
    const verticals = Bejeweled.getVerticalMoves(grid);

    moves.push(...horizontals, ...verticals)

    return moves;
  }

  static checkAdjacent(grid, row, col, target, ...skipIds) {

    const colLower = col - 1 < 0 ? 0 : col - 1;
    const colUpper = col + 1 >= grid[0].length ? grid[0].length - 1 : col + 1;

    const rowLower = row - 1 < 0 ? 0 : row - 1;
    const rowUpper = row + 1 >= grid.length ? grid.length - 1 : row  + 1;

    for (let r = row - 1, c = col - 1; r >= rowLower && r <= rowUpper && c >= colLower && c <= colUpper; r += 2, c += 2) {

      let el1 = grid[r][col]; // Up // Down
      let el1Id = `${r}${col}`;

      let el2 = grid[row][c]; // Left // Right
      let el2Id = `${row}${c}`;

      if (!(skipIds.includes(el1Id)) && el1 === target) {
        return true;
      } else if (!(skipIds.includes(el2Id)) && el2 === target) {
        return true;
      }

    }

    return false;
  }

  static getHorizontalMoves(grid) {
    const horizontals = [];

    for (let r = 0; r < grid.length; r++) {
      let moves = [];

      for (let c = 0; c < grid[0].length - 2; c++) {
        let el = grid[r][c];
        let second = grid[r][c + 1];
        let third = grid[r][c + 2];

        let firstAndSecond = el === second;
        let secondAndThird = second === third;
        let thirdAndFirst = el === third;

        let target;
        let replaceCol;
        let id1;
        let id2;

        if (!firstAndSecond && secondAndThird) {
          target = second;
          replaceCol = c;
          id1 = `${r}${c + 1}`;
          id2 = `${r}${c + 2}`;
        } else if (!secondAndThird && thirdAndFirst) {
          target = third;
          replaceCol = c + 1;
          id1 = `${r}${c + 2}`;
          id2 = `${r}${c}`;
        } else if (!thirdAndFirst && firstAndSecond) {
          target = el;
          replaceCol = c + 2;
          id1 = `${r}${c}`;
          id2 = `${r}${c + 1}`;
        }


        let areTwoSame = firstAndSecond || secondAndThird || thirdAndFirst;
        let adjacentMatch;

        if (!!replaceCol) {
          adjacentMatch = Bejeweled.checkAdjacent(grid, r, replaceCol, target, id1, id2);
        } else {
          adjacentMatch = false;
        }

        if (areTwoSame && adjacentMatch) {
          let move = {
            row: r,
            col1: c,
            col2: c + 1,
            col3: c + 2
          }

          moves.push(move);
        }
      }

      horizontals.push(...moves);
    }

    return horizontals;
  }

  static getVerticalMoves(grid) {
    const verticals = [];

    for (let c = 0; c < grid[0].length; c++) {
      let moves = [];

      for (let r = 0; r < grid.length - 2; r++) {
        let el = grid[r][c];
        let second = grid[r + 1][c];
        let third = grid[r + 2][c];

        let firstAndSecond = el === second;
        let secondAndThird = second === third;
        let thirdAndFirst = el === third;

        let target;
        let replaceRow;
        let id1;
        let id2;

        if (!firstAndSecond && secondAndThird) {
          target = second;
          replaceRow = r;
          id1 = `${r + 1}${c}`;
          id2 = `${r + 2}${c}`;
        } else if (!secondAndThird && thirdAndFirst) {
          target = third;
          replaceRow = r + 1;
          id1 = `${r + 2}${c}`;
          id2 = `${r}${c}`;
        } else if (!thirdAndFirst && firstAndSecond) {
          target = el;
          replaceRow = r + 2;
          id1 = `${r}${c}`;
          id2 = `${r + 1}${c}`;
        }

        let areTwoSame = firstAndSecond || secondAndThird || thirdAndFirst;
        let adjacentMatch;

        if (!!replaceRow) {
          adjacentMatch = Bejeweled.checkAdjacent(grid, replaceRow, c, target, id1, id2);
        } else {
          adjacentMatch = false;
        }

        if (areTwoSame && adjacentMatch) {
          let move = {
            col: c,
            row1: r,
            row2: r + 1,
            row3: r + 2
          }

          moves.push(move);
        }
      }

      verticals.push(...moves);
    }

    return verticals;
  }

  static getHorizontalMatches(grid) {

    const horizontals = [];

    for (let r = 0; r < grid.length; r++) {
      let matches = [];

      for (let c = 0; c < grid[0].length - 2; c++) {
        let el = grid[r][c];
        let second = grid[r][c + 1];
        let third = grid[r][c + 2];

        if (el === second && second === third) {
          let match = {
            row: r,
            col1: c,
            col2: c + 1,
            col3: c + 2
          }

          matches.push(match);
        }
      }

      horizontals.push(...matches)
    }

    return horizontals;
  }

  static getVerticalMatches(grid) {
    const verticals = [];

    for (let c = 0; c < grid[0].length; c++) {
      let matches = [];

      for (let r = 0; r < grid.length - 2; r++) {
        let el = grid[r][c];
        let second = grid[r + 1][c];
        let third = grid[r + 2][c];

        if (el === second && second === third) {
          let match = {
            col: c,
            row1: r,
            row2: r + 1,
            row3: r + 2
          }

          matches.push(match);
        }
      }

      verticals.push(...matches)
    }

    return verticals;
  }

}

module.exports = Bejeweled;
