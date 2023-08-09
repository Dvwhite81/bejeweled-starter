const Bejeweled = require("./bejeweled");
const Screen = require("./screen");

class Cursor {

  constructor(numRows, numCols) {
    this.numRows = numRows;
    this.numCols = numCols;

    this.row = 0;
    this.col = 0;

    this.gridColor = 'black';
    this.cursorColor = 'yellow';

    this.swapActive = false;
    this.bejeweled;

  }

  resetBackgroundColor() {
    Screen.setBackgroundColor(this.row, this.col, this.gridColor);
  }

  setBackgroundColor() {
    Screen.setBackgroundColor(this.row, this.col, this.cursorColor);
    Screen.render();
  }

  rowIncrement(direction = true) {
    this.resetBackgroundColor();
    if (direction) {
      this.row++;
    } else {
      this.row--;
    }
    this.setBackgroundColor();
  }

  colIncrement(direction = true) {
    this.resetBackgroundColor();
    if (direction) {
      this.col++;
    } else {
      this.col--;
    }
    this.setBackgroundColor();
  }

  up() {
    if (this.row === 0) {
      this.swapActive = false;
      return false;

    } else if (this.swapActive) {
      this.swapActive = false;
      return this.bejeweled.checkSwap(Screen.grid, 'up');

    } else {
      this.resetBackgroundColor();
      this.row--;
      this.setBackgroundColor();
    }
  }

  down() {
    if (this.row === this.numRows - 1) {
      this.swapActive = false;
      return false;

    } else if (this.swapActive) {
      this.swapActive = false;
      return this.bejeweled.checkSwap(Screen.grid, 'down');

    } else {
      this.resetBackgroundColor();
      this.row++;
      this.setBackgroundColor();
    }
  }

  left() {
    if (this.col === 0) {
      this.swapActive = false;
      return false;

    } else if (this.swapActive) {
      this.swapActive = false;
      return this.bejeweled.checkSwap(Screen.grid, 'left');

    } else {
      this.resetBackgroundColor();
      this.col--;
      this.setBackgroundColor();
    }
  }

  right() {
    if (this.col === this.numCols - 1) {
      this.swapActive = false;
      return false;

    } else if (this.swapActive) {
      this.swapActive = false;

      return this.bejeweled.checkSwap(Screen.grid, 'right');

    } else {
      this.resetBackgroundColor();
      this.col++;
      this.setBackgroundColor();
    }
  }

}


module.exports = Cursor;
