import { Board } from "./Board";
import { Colors } from "./Colors";
import { Figure, FigureNames } from "./figures/Figure";

export class Cell {
  readonly x: number;
  readonly y: number;
  readonly color: Colors;
  figure: Figure | null;
  board: Board;
  available: boolean;
  kingCheck: boolean;
  id: number;
  
  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random();
    this.kingCheck = false;
  }

  isEmpty(): boolean {
    return this.figure === null;
  }

  isEnemy(target: Cell): boolean {
    if (target.figure) 
      return this.figure?.color !== target.figure.color;
    return false;
  }

  isEmptyVertical(target: Cell): boolean {
    if (this.x !== target.x) {
      return false;
    }

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    for (let y = min + 1; y < max; y++) {
      if (!this.board.getCell(this.x, y).isEmpty()) {
        return false;
      }
    }

    return true;
  }

  isEmptyHorizontal(target: Cell): boolean {
    if (this.y !== target.y) {
      return false;
    }

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    for (let x = min + 1; x < max; x++) {
      if (!this.board.getCell(x, this.y).isEmpty()) {
        return false;
      }
    }

    return true;
  }

  isEmptyDiagonal(target: Cell): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    if (absX !== absY) {
      return false;
    } 

    const dy = this.y < target.y ? 1 : -1;
    const dx = this.x < target.x ? 1 : -1;
    for (let i = 1; i < absY; i++) {
      if (!this.board.getCell(this.x + dx*i, this.y + dy*i).isEmpty()) {
        return false;
      }
    }

    return true;
  }

  setFigure(figure: Figure) {
    this.figure = figure;
    this.figure.cell = this;
  }

  moveFigure(target: Cell) {
    // Проверяем возможность хода
    const color = this.figure?.color;
    if (this.figure?.canMove(target)) {
      // Рокировка
      if (this.figure.name === FigureNames.KING && Math.abs(this.x - target.x) === 2) {
        let rookCellX = this.x - target.x > 0 ? 0 : 7;
        let rookNewCellX = this.x - target.x > 0 ? 3 : 5;
        let rookCell = this.board.getCell(rookCellX, this.y);
        let rookNewCell = this.board.getCell(rookNewCellX, this.y);
        rookCell.moveFigure(rookNewCell);
      }
      this.figure.moveFigure(target);
      target.setFigure(this.figure);
      this.figure = null;
    }
    if (color)
      this.board.isCheck(color === Colors.BLACK ? Colors.WHITE : Colors.BLACK);
  }  
}