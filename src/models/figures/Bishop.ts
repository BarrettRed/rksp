import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from "../../assets/bishop_black.svg"
import whiteLogo from "../../assets/bishop_white.svg"

export class Bishop extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.BISHOP;
  }

  getCopyFigure(cell: Cell): Figure {
    return new Bishop(this.color, cell);
  }

  canMove(target: Cell, test: boolean = true): boolean {
    if (!super.canMove(target, test)) {
      return false;
    }
    if (this.cell.isEmptyDiagonal(target)) {
      return true;
    }
    return false;
  }
}