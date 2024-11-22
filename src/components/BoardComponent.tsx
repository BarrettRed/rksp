import React, { FC, useEffect, useState } from 'react';
import { Board } from '../models/Board';
import CellComponent from './CellComponent';
import { Cell } from '../models/Cell';
import { Player } from '../models/Player';

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard, currentPlayer, swapPlayer }) => {
  const [selectedMouseCell, setSelectedMouseCell] = useState<Cell | null>(null);
  const [selectedKeyboardCell, setSelectedKeyboardCell] = useState<Cell | null>(null);
  const [activeKeyboardCell, setActiveKeyboardCell] = useState<Cell | null>(null);
  const [isMouse, setIsMouse] = useState<boolean>(true);

  function click(cell: Cell) {
    if (!isMouse) {
      setIsMouse(true); // Режим мыши
      setActiveKeyboardCell(null);
      setSelectedKeyboardCell(null);
      board.dropHighlightedCells();
    }
    
    if (selectedMouseCell && selectedMouseCell !== cell && selectedMouseCell.figure?.canMove(cell)) {
      selectedMouseCell.moveFigure(cell);
      swapPlayer();
      setSelectedMouseCell(null);
      board.dropHighlightedCells();
      updateBoard();
    } else if (cell.figure?.color === currentPlayer?.color) {
      setSelectedMouseCell(cell);
      highlightCells(cell);
    }
  }

  function highlightCells(cell: Cell) {
    board.dropHighlightedCells();
    if (cell.figure?.color === currentPlayer?.color) {
      board.highlightCells(cell);
    }
    updateBoard();
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (isMouse) {
        setIsMouse(false); // Режим клавиатуры
        setSelectedMouseCell(null);
        board.dropHighlightedCells();
      }
      

      if (!selectedKeyboardCell && currentPlayer) {
        const firstCellWithFigure = board.cells.flat().find(cell => cell.figure?.color === currentPlayer.color);
        setSelectedKeyboardCell(firstCellWithFigure || null);
        return;
      }

      if (selectedKeyboardCell) {
        let newX = selectedKeyboardCell.x;
        let newY = selectedKeyboardCell.y;

        switch (event.key) {
          case 'ArrowUp':
            newY = Math.max(0, selectedKeyboardCell.y - 1);
            break;
          case 'ArrowDown':
            newY = Math.min(7, selectedKeyboardCell.y + 1);
            break;
          case 'ArrowLeft':
            newX = Math.max(0, selectedKeyboardCell.x - 1);
            break;
          case 'ArrowRight':
            newX = Math.min(7, selectedKeyboardCell.x + 1);
            break;
          case 'Enter':
            if (activeKeyboardCell && activeKeyboardCell.figure?.canMove(selectedKeyboardCell)) {
              activeKeyboardCell.moveFigure(selectedKeyboardCell);
              swapPlayer();
              setActiveKeyboardCell(null);
              setSelectedKeyboardCell(null);
              board.dropHighlightedCells();
              updateBoard();
            } else if (selectedKeyboardCell.figure?.color === currentPlayer?.color) {
              setActiveKeyboardCell(selectedKeyboardCell);
              highlightCells(selectedKeyboardCell);
            }
            return;
          default:
            return;
        }

        const newCell = board.getCell(newX, newY);
        setSelectedKeyboardCell(newCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeyboardCell, activeKeyboardCell, board, currentPlayer]);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="board-wrapper">
       <div className="numbers left">
        {numbers.map((number, index) => (
          <div key={index} className="number">{number}</div>
        ))}
      </div>
      <div className="letters top">
        {letters.map((letter, index) => (
          <div key={index} className="letter">{letter}</div>
        ))}
      </div>
      <div className="board">
        {board.cells.map((row: Cell[], rowIndex: number) => 
          <React.Fragment key={rowIndex}>
            {row.map(cell => 
              <CellComponent
                click={click}
                cell={cell}
                key={cell.id}
                selected={
                  isMouse
                    ? cell.x === selectedMouseCell?.x && cell.y === selectedMouseCell?.y
                    : cell.x === selectedKeyboardCell?.x && cell.y === selectedKeyboardCell?.y
                }
              />
            )}
          </React.Fragment>
        )}
      </div>
      <div className="numbers right">
        {numbers.map((number, index) => (
          <div key={index} className="number">{number}</div>
        ))}
      </div>
      <div className="letters bottom">
        {letters.map((letter, index) => (
          <div key={index} className="letter">{letter}</div>
        ))}
      </div>
    </div>
  );
};

export default BoardComponent;