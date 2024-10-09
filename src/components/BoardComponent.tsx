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
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [selectedKeyCell, setSelectedKeyCell] = useState<Cell | null>(null);
  const [isSelectingTarget, setIsSelectingTarget] = useState<boolean>(false); // Отслеживание выбора цели

  function click(cell: Cell) {
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      selectedCell.moveFigure(cell);
      swapPlayer();
      setSelectedCell(null);
      setIsSelectingTarget(false);
      board.dropHighlightedCells();  // Ход завершен
    } else {
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
        setIsSelectingTarget(true);  // Фигура выбрана
      }
    }
  }

  useEffect(() => {
    if (selectedCell) {
      highlightCells();
    }
  }, [selectedCell]);

  function highlightCells() {
    if (selectedCell?.figure?.color === currentPlayer?.color) {
      board.highlightCells(selectedCell);
    }
    updateBoard(); 
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    newBoard.winner = board.winner; 
    setBoard(newBoard);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedCell && currentPlayer) {
        // Найдем первую клетку с фигурой текущего игрока, если нет выбранной
        for (let row of board.cells) {
          for (let cell of row) {
            if (cell.figure?.color === currentPlayer.color) {
              setSelectedCell(cell);
              return; // Установим только первую найденную клетку
            }
          }
        }
      }
  
      if (selectedCell) {
        let newX = selectedCell.x;
        let newY = selectedCell.y;
  
        switch (event.key) {
          case 'ArrowUp':
            newY = Math.max(0, selectedCell.y - 1);
            break;
          case 'ArrowDown':
            newY = Math.min(7, selectedCell.y + 1);
            break;
          case 'ArrowLeft':
            newX = Math.max(0, selectedCell.x - 1);
            break;
          case 'ArrowRight':
            newX = Math.min(7, selectedCell.x + 1);
            break;
          case 'Enter':
            if (selectedKeyCell && selectedCell !== selectedKeyCell 
                                && selectedKeyCell.figure?.canMove(selectedCell)) {
              selectedKeyCell.moveFigure(selectedCell);
              swapPlayer();
              setSelectedCell(null);
              setSelectedKeyCell(null);
              setIsSelectingTarget(false);
              board.dropHighlightedCells();  // Ход завершен
            } else {
              if (selectedCell.figure?.color === currentPlayer?.color) {
                setSelectedKeyCell(selectedCell);
                setIsSelectingTarget(true);  // Фигура выбрана
              }
            }
            break;
          default:
            return;
        }

        const newCell = board.getCell(newX, newY);
        setSelectedCell(newCell);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, currentPlayer, isSelectingTarget]);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="board-wrapper">
      <div className="board">
        {board.cells.map((row: Cell[], rowIndex: number) => 
          <React.Fragment key={rowIndex}>
            {row.map(cell => 
              <CellComponent
                click={click}
                cell={cell}
                key={cell.id}
                selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
              />
            )}
          </React.Fragment>
        )}
      </div>
      <div className="numbers">
        {numbers.map((number, index) => (
          <div key={index} className="number">{number}</div>
        ))}
      </div>
      <div className="letters">
        {letters.map((letter, index) => (
          <div key={index} className="letter">{letter}</div>
        ))}
      </div>
    </div>
  );
}

export default BoardComponent;
