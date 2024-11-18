import { Cell } from "../Cell";
import { Colors } from "../Colors";
import logo from "../../assets/bishop_black.svg"

export enum FigureNames {
  FIGURE="Фигура",
  KING="Король",
  KNIGHT="Конь",
  PAWN="Пешка",
  QUEEN="Ферзь",
  ROOK="Ладья",
  BISHOP="Слон"
}

export abstract class Figure {
  color: Colors;
  logo: typeof logo | null;
  cell: Cell;
  name: FigureNames;
  isFirstMove: boolean;
  id: number;

  constructor(color: Colors, cell: Cell) {
    this.color = color;
    this.cell = cell;
    this.cell.figure = this;
    this.logo = null;
    this.name = FigureNames.FIGURE;
    this.isFirstMove = true;
    this.id = Math.random();
  }

  abstract getCopyFigure(cell: Cell) : Figure;

  canMove(target: Cell, test: boolean = true) : boolean {
    if (target.figure?.color === this.color) {
      return false;
    }
    if (test && this.cell.board.isCheck(this.color)) {
      // Симулируем ход на новой доске.
      const simulatedBoard = this.cell.board.getRealCopyBoard();
      const simulatedCell = simulatedBoard.getCell(this.cell.x, this.cell.y);
      const simulatedTarget = simulatedBoard.getCell(target.x, target.y);

      // Выполняем ход.
      if (simulatedCell.figure)
        simulatedTarget.setFigure(simulatedCell.figure);
      simulatedCell.figure = null;

      // Проверяем, остался ли король под шахом.
      if (simulatedBoard.isCheck(this.color)) {
        return false; // Есть хотя бы один ход, который спасает от шаха.
      }
    }
    return true;
  }

  moveFigure(target: Cell) {
    this.isFirstMove = false;
  }
}