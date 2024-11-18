import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from "../../assets/pawn_black.svg"
import whiteLogo from "../../assets/pawn_white.svg"
import { Queen } from "./Queen";

export class Pawn extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }

  getCopyFigure(cell: Cell, test: boolean = false): Figure {
    return new Pawn(this.color, cell);
  }

  canMove(target: Cell, test: boolean = true): boolean {
    if (!super.canMove(target, test)) {
      return false;
    }

    const dir = this.color === Colors.BLACK ? 1 : -1;  // 53:49
    if (this.cell.x === target.x && target.isEmpty()) {
      if (this.cell.y + dir === target.y)
        return true;
      if (this.cell.y + 2 * dir === target.y && this.isFirstMove && this.cell.isEmptyVertical(target))
        return true;
    }
    if (this.cell.y + dir === target.y && Math.abs(this.cell.x - target.x) === 1
      && this.cell.isEnemy(target))
      return true;
    return false;
  }
  
  moveFigure(target: Cell): void {
    super.moveFigure(target);
    if (target.y === 0) {
      this.cell.figure = new Queen(Colors.WHITE, this.cell);
    }
    if (target.y === 7) {
      this.cell.figure = new Queen(Colors.BLACK, this.cell);
    }
  }
}