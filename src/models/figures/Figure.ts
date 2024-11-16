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

  canMove(target: Cell) : boolean {
    if (target.figure?.color === this.color) {
      return false;
    }
    return true;
  }

  moveFigure(target: Cell) {
    this.isFirstMove = false;
  }
}