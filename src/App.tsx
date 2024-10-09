import React, { useEffect, useState } from 'react';
import './App.css';
import BoardComponent from './components/BoardComponent';
import { Board } from './models/Board';
import { Player } from './models/Player';
import { Colors } from './models/Colors';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { FigureNames } from './models/figures/Figure';

const initializeAssistant = (getState: any) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: '',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  } else {
    return createAssistant({ getState });
  }
};


const App = () => {
  const [board, setBoard] = useState(new Board());
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK));
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [assistant, setAssistant] = useState<any>(null);

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(whitePlayer);
  }

  function swapPlayer() {
    // Проверяем наличие вражеского короля на доске
    const enemyKing = board.cells.flat().some(cell => 
      cell.figure?.name === FigureNames.KING && cell.figure.color !== currentPlayer?.color
    );
  
    if (!enemyKing) {
      // Если вражеского короля нет, текущий игрок побеждает
      const winnerColor = currentPlayer?.color === Colors.WHITE ? "Белые" : "Черные";
      console.log(`${winnerColor} побеждают!`);
      //alert(`${winnerColor} побеждают!`);
  
      const data = {
        action: {
          action_id: "game_over",
          parameters: {value: `${winnerColor} побеждают!`}
        },
      };
      const unsubscribe = assistant.sendData(data, (data: any) => {
        // функция, вызываемая, если на sendData() был отправлен ответ
        const {type, payload} = data;
        console.log("sendData onData:", type, payload);
        unsubscribe();
      });
    } else {
      // Если король остался, продолжаем игру
      setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
    }
  }
  

  useEffect(() => {
    restart();
    setCurrentPlayer(whitePlayer);

    const assistantInstance = initializeAssistant(() => getStateForAssistant());
    setAssistant(assistantInstance);

    assistantInstance.on('data', (event: any) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event;
      if (action) {
        dispatchAssistantAction(action);
      }
    });

    assistantInstance.on('start', () => {
      let initialData = assistantInstance.getInitialData();
      console.log('assistant.on(start)', initialData);
    });

    assistantInstance.on('command', (event: any) => {
      console.log('assistant.on(command)', event);
    });

    assistantInstance.on('error', (event: any) => {
      console.log('assistant.on(error)', event);
    });

    assistantInstance.on('tts', (event: any) => {
      console.log('assistant.on(tts)', event);
    });
  }, []);

  const getStateForAssistant = () => {
    console.log('getStateForAssistant: currentPlayer:', currentPlayer);
    const state = {
      current_player: currentPlayer ? currentPlayer.color : null,
    };
    console.log('getStateForAssistant: state:', state);
    return state;
  };

  const dispatchAssistantAction = (action: any) => {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'restart':
          restart();
          break;
        case 'move':
          const moves = getCorrectCoord(action.params);
          move(moves);
          console.log(moves);
          break; 
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    }
  };



  function getCorrectCoord(str: string) {
    str = str.toLocaleLowerCase();
    str = str.replaceAll(",", "").replaceAll(".", "").replaceAll(" ", "").replaceAll("-", "");
    str = str.replaceAll("эй", "A");
    str = str.replaceAll("би", "B");
    str = str.replaceAll("и", "E");
    str = str.replaceAll("ф", "F");
    str = str.replaceAll("д", "D");
    str = str.replaceAll("die", "D");
    str = str.toLocaleUpperCase();
    return str;
  }

  function move(moves: string) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const from_y = letters.indexOf(moves.charAt(0));
    const from_x = Math.abs(8 - parseInt(moves.charAt(1)));
    const to_y = letters.indexOf(moves.charAt(2));
    const to_x = Math.abs(8 - parseInt(moves.charAt(3)));
    console.log(from_x, from_y, to_x, to_y);

    if (from_x === -1 || from_y === -1 || to_x === -1 || to_y === -1) 
      return;

    const fromCell = board.getCell(from_y, from_x);
    const toCell = board.getCell(to_y, to_x);
    // console.log(fromCell, toCell);
    if (fromCell.figure?.color === currentPlayer?.color && fromCell.figure?.canMove(toCell)) {
      fromCell.moveFigure(toCell);
      swapPlayer();
      setBoard(board.getCopyBoard());
    }
  }

  return (
    <div className="app">
      <BoardComponent 
        board={board}
        setBoard={setBoard}  
        currentPlayer={currentPlayer}
        swapPlayer={swapPlayer}
      />
    </div>
  );
};

export default App;
