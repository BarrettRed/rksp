import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from "../../assets/king_black.svg"
import whiteLogo from "../../assets/king_white.svg"

export class King extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KING;
  }

  getCopyFigure(cell: Cell): Figure {
    return new King(this.color, cell);
  }

  canMove(target: Cell, test: boolean = true): boolean {
    if (!super.canMove(target, test)) {
      return false;
    }
    
    const dx = this.cell.x - target.x;
    const dy = Math.abs(this.cell.y - target.y);

    if (Math.abs(dx) <= 1 && dy <= 1 && (target.isEmpty() || this.cell.isEnemy(target))) {
      let newBoard = this.cell.board.getRealCopyBoard();
      let newCell = newBoard.getCell(this.cell.x, this.cell.y);
      let newTarget = newBoard.getCell(target.x, target.y);
      if (newCell.figure) {
      newTarget.setFigure(newCell.figure);
      newCell.figure = null;
      }
      console.log(newBoard);
      return !newBoard.isCellUnderAttack(newBoard.getCell(newTarget.x, newTarget.y));
    }

    if (Math.abs(dx) === 2 && dy === 0 && this.isFirstMove) {
      let rookCellX = dx > 0 ? 0 : 7;
      let rookCell = target.board.getCell(rookCellX, this.cell.y);
      return rookCell.figure?.name === FigureNames.ROOK &&
             rookCell.figure?.isFirstMove &&
             this.cell.isEmptyHorizontal(rookCell)
    }

    return false;
  }
}