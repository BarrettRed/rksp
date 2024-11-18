import React, { Component } from 'react';
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

interface AppState {
  board: Board;
  whitePlayer: Player;
  blackPlayer: Player;
  currentPlayer: Player | null;
}

class App extends Component<{}, AppState> {
  assistant: any;

  constructor(props: {}) {
    super(props);
    this.state = {
      board: new Board(),
      whitePlayer: new Player(Colors.WHITE),
      blackPlayer: new Player(Colors.BLACK),
      currentPlayer: null,
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event: any) => {
      console.log('assistant.on(data)', event);
      const { action } = event;
      if (action) {
        this.dispatchAssistantAction(action);
      }
    });

    this.assistant.on('start', () => {
      let initialData = this.assistant.getInitialData();
      console.log('assistant.on(start)', initialData);
    });

    this.assistant.on('command', (event: any) => {
      console.log('assistant.on(command)', event);
    });

    this.assistant.on('error', (event: any) => {
      console.log('assistant.on(error)', event);
    });

    this.assistant.on('tts', (event: any) => {
      console.log('assistant.on(tts)', event);
    });
  }

  componentDidMount() {
    this.restart();
    this.setState({ currentPlayer: this.state.whitePlayer });
  }

  getStateForAssistant() {
    const state = {
      board: {
        currentPlayer: this.state.currentPlayer?.color,
      },
    };
    return state;
  }

  dispatchAssistantAction = (action: any) => {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'restart':
          this.restart();
          break;
        case 'move':
          const moves = this.getCorrectCoord(action.params);
          this.move(moves);
          console.log(moves);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    }
  };

  getCorrectCoord(str: string) {
    str = str.toLocaleLowerCase();
    str = str.replaceAll("один", "1")
      .replaceAll("два", "2")
      .replaceAll("три", "3")
      .replaceAll("четыре", "4")
      .replaceAll("пять", "5")
      .replaceAll("шесть", "6")
      .replaceAll("восемь", "8")
      .replaceAll("семь", "7");
    str = str.replaceAll(",", "")
      .replaceAll(".", "")
      .replaceAll(" ", "")
      .replaceAll("-", "");
    str = str.replaceAll("эйч", "H")
      .replaceAll("эф", "F")
      .replaceAll("эй", "A")
      .replaceAll("би", "B")
      .replaceAll("б", "B")
      .replaceAll("se", "C")
      .replaceAll("цэ", "C")
      .replaceAll("ц", "C")
      .replaceAll("си", "C")
      .replaceAll("ф", "F")
      .replaceAll("джи", "G")
      .replaceAll("j", "G")
      .replaceAll("ди", "D")
      .replaceAll("д", "D")
      .replaceAll("die", "D")
      .replaceAll("de", "D")
      .replaceAll("the", "D")
      .replaceAll("и", "E")
      .replaceAll("аш", "H")
      .replaceAll("г", "G")
      .replaceAll("а", "A")
      .replaceAll("е", "E");

    str = str.toLocaleUpperCase();
    console.log(str);
    return str;
  }

  move(moves: string) {
    const { board, currentPlayer } = this.state;
    const pattern = /[A-H][1-8][A-H][1-8]/

    if (!(pattern.test(moves) && moves.length === 4)) {
      this.sendData("noMatch", ``);
      return;
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const from_y = letters.indexOf(moves.charAt(0));
    const from_x = Math.abs(8 - parseInt(moves.charAt(1)));
    const to_y = letters.indexOf(moves.charAt(2));
    const to_x = Math.abs(8 - parseInt(moves.charAt(3)));
    console.log(from_x, from_y, to_x, to_y);

    const fromCell = board.getCell(from_y, from_x);
    const toCell = board.getCell(to_y, to_x);
    const color = currentPlayer?.color === Colors.WHITE ? "белые" : "черные";
    if (!fromCell.figure) {
      this.sendData("no_figure", `на такой клетке нет фигуры`);
    }
    else if (fromCell.figure?.color !== currentPlayer?.color) {
      this.sendData("wrong_figure", `сейчас ходят ${color}!`);
    }
    else if (!fromCell.figure?.canMove(toCell)) {
      this.sendData("wrong_move", `так ходить нельзя`);
    }
    else if (fromCell.figure?.color === currentPlayer?.color && fromCell.figure?.canMove(toCell)) {
      fromCell.moveFigure(toCell);
      this.swapPlayer();
      this.setState({ board: board.getCopyBoard() });
    }
  }

  swapPlayer = () => {
    const { board, currentPlayer, whitePlayer, blackPlayer } = this.state;
    board.dropHighlightedCells();
    this.isGameOver();
    this.setState((state) => {
      return {currentPlayer: state.currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer}
    });
  };

  isGameOver = () => {
    const color = this.state.currentPlayer?.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    if (this.state.currentPlayer && this.state.board.isCheckMate(color)) {
      const winnerColor = this.state.currentPlayer.color === Colors.WHITE ? "Белые" : "Черные";
      console.log(`${winnerColor} побеждают!`);
      this.sendData("game_over", `Шах и мат! ${winnerColor} побеждают!`);
      this.restart(); 
    }
  } 
  sendData(action: string, val: string) {
    const data = {
      action: {
        action_id: action,
        parameters: { value: val },
      },
    };
    const unsubscribe = this.assistant.sendData(data, (data: any) => {
      const { type, payload } = data;
      console.log("sendData onData:", type, payload);
      unsubscribe();
    });
  }
 
  restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    this.setState({ board: newBoard });
    this.setState({
      currentPlayer: this.state.whitePlayer,
    });
  }

  render() {
    const { board, currentPlayer } = this.state;

    return (
      <div className="app">
        <BoardComponent
          board={board}
          setBoard={(newBoard: Board) => this.setState({ board: newBoard })}
          currentPlayer={currentPlayer}
          swapPlayer={this.swapPlayer}
        />
      </div>
    );
  }
}

export default App;
