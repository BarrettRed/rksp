import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Bishop } from "./figures/Bishop";
import { FigureNames } from "./figures/Figure";
import { King } from "./figures/King";
import { Knight } from "./figures/Knight";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Rook } from "./figures/Rook";

export class Board {
  cells: Cell[][] = [];

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null));
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null));
        }
      }
      this.cells.push(row);
    }
  }

  public highlightCells(selectedCell: Cell | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = !!selectedCell?.figure?.canMove(target);
      }
    }
  }

  public dropHighlightedCells() {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = false;
      }
    }
  }
  public FindKing(color: Colors): Cell {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        const figure = cell.figure;
        if (figure)
          if (figure.color === color && figure.name === FigureNames.KING)
            return cell;
      }
    }
    return this.cells[0][0];
  }

  public isCheck(color: Colors) {
    this.cells.forEach((row) => row.forEach((cell) => cell.kingCheck = false))
    const kingCell = this.FindKing(color);
    kingCell.kingCheck = this.isCellUnderAttack(kingCell);
    return kingCell.kingCheck;
  }

  public isCheckMate(color: Colors): boolean {
    if (!this.isCheck(color)) {
      return false; // Нет шаха — нет мата.
    }
  
    // Проверяем, есть ли хотя бы один ход, спасающий короля.
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure?.color === color) {
          // Перебираем все доступные ходы фигуры.
          const availableMoves = this.getAvailableMovesForFigure(cell);
          for (const move of availableMoves) {
            // Симулируем ход на новой доске.
            const simulatedBoard = this.getRealCopyBoard();
            const simulatedCell = simulatedBoard.getCell(cell.x, cell.y);
            const simulatedTarget = simulatedBoard.getCell(move.x, move.y);
  
            // Выполняем ход.
            if (simulatedCell.figure)
              simulatedTarget.setFigure(simulatedCell.figure);
            simulatedCell.figure = null;
  
            // Проверяем, остался ли король под шахом.
            if (!simulatedBoard.isCheck(color)) {
              return false; // Есть хотя бы один ход, который спасает от шаха.
            }
          }
        }
      }
    }
  
    return true; // Нет доступных ходов, чтобы избежать шаха.
  }
  
  private getAvailableMovesForFigure(cell: Cell): Cell[] {
    const moves: Cell[] = [];
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const target = this.cells[i][j];
        if (cell.figure?.canMove(target)) {
          moves.push(target);
        }
      }
    }
    return moves;
  }
  

  public isCellUnderAttack(target: Cell) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure?.color !== target.figure?.color) {
          if (cell.figure?.name === FigureNames.KING) {
            const dx = Math.abs(cell.x - target.x);
            const dy = Math.abs(cell.y - target.y);
            if (dx <= 1 && dy <= 1) return true;
          }
          if (cell.figure?.canMove(target, false)) return true;
        }
      }
    }
    return false;
  }
  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    return newBoard;
  }

  public getRealCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.initCells();
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure)
          newBoard.cells[i][j].figure = cell.figure.getCopyFigure(newBoard.cells[i][j]);
      }
    }
    return newBoard;
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1));
      new Pawn(Colors.WHITE, this.getCell(i, 6));
    }
  }

  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0));
    new Knight(Colors.BLACK, this.getCell(6, 0));
    new Knight(Colors.WHITE, this.getCell(1, 7));
    new Knight(Colors.WHITE, this.getCell(6, 7));
  }

  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0));
    new King(Colors.WHITE, this.getCell(4, 7));
  }

  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0));
    new Bishop(Colors.BLACK, this.getCell(5, 0));
    new Bishop(Colors.WHITE, this.getCell(2, 7));
    new Bishop(Colors.WHITE, this.getCell(5, 7));
  }

  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0));
    new Rook(Colors.BLACK, this.getCell(7, 0));
    new Rook(Colors.WHITE, this.getCell(0, 7));
    new Rook(Colors.WHITE, this.getCell(7, 7));
  }

  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0));
    new Queen(Colors.WHITE, this.getCell(3, 7));
  }

  public addFigures() {
    this.addBishops();
    this.addKings();
    this.addKnights();
    this.addPawns();
    this.addQueens();
    this.addRooks();
  }

}