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
  id: number;
  
  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random();
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
    if (this.figure?.canMove(target)) {
      // Проверяем, является ли целевая фигура королем
      if (target.figure?.name === FigureNames.KING) {
        // Устанавливаем победителя, если король съеден
        const winnerColor = this.figure.color === Colors.BLACK ? "Черные" : "Белые";
        this.board.winner = winnerColor;
        console.log(this.board.winner + " побеждают");
      }
      
      this.figure.moveFigure(target);
      target.setFigure(this.figure);
      this.figure = null;
      
      // Обновляем доску и сохраняем победителя
      const currentWinner = this.board.winner; // сохраняем победителя
      const newBoard = this.board.getCopyBoard();
      newBoard.winner = currentWinner; // восстанавливаем победителя в копии
      this.board = newBoard; // обновляем доску
    }
  }
  
  
}