import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from "../../assets/knigh_black.svg"
import whiteLogo from "../../assets/knight_white.svg"

export class Knight extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
  }

  getCopyFigure(cell: Cell): Figure {
    return new Knight(this.color, cell);
  }

  canMove(target: Cell, test: boolean = true): boolean {
    if (!super.canMove(target, test)) {
      return false;
    }
    
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
  }
}