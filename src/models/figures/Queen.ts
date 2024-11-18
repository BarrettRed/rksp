import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from "../../assets/queen_black.svg"
import whiteLogo from "../../assets/queen_white.svg"
export class Queen extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.QUEEN;
  }

  getCopyFigure(cell: Cell): Figure {
    return new Queen(this.color, cell);
  }

  canMove(target: Cell, test: boolean = true): boolean {
    if (!super.canMove(target, test)) {
      return false;
    }
    if (this.cell.isEmptyVertical(target)) {
      return true;
    }
    if (this.cell.isEmptyHorizontal(target)) {
      return true;
    }
    if (this.cell.isEmptyDiagonal(target)) {
      return true;
    }
    return false;
  }
}