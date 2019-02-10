/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ color: props.clr, background: props.bgd }}
    >
      {props.value}
    </button>
  );
}

function ListOrderReverse(props) {
  if (props.toggle) {
    return <ol reversed>{props.value}</ol>;
  } else {
    return <ol>{props.value}</ol>;
  }
}

class Board extends React.Component {
  renderSquare(i, clr, bgd) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => {
          this.props.onClick(i);
        }}
        clr={clr}
        bgd={bgd}
      />
    );
  }

  render() {
    let element = [],
      clr = 'black',
      bgd = 'white';
    for (let i = 0; i < 9; i += 3) {
      let square = [];
      for (let j = 0; j < 3; j++) {
        if (this.props.winnerList && this.props.winnerList.includes(i + j)) {
          clr = 'white';
          bgd = 'black';
        } else {
          clr = 'black';
          bgd = 'white';
        }
        square.push(this.renderSquare(i + j, clr, bgd));
      }
      element.push(<div className="board-row">{square}</div>);
    }
    return <div>{element}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      moveListBold: ['normal'],
      iList: [0],
      xIsNext: true,
      stepNumber: 0,
      toggle: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    const iList = this.state.iList.slice(0, this.state.stepNumber + 1);
    const moveListBold = this.state.moveListBold.slice(
      0,
      this.state.stepNumber + 1
    );

    if (calculateWinner(squares)) {
      return;
    }
    if (squares[i]) return;
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    for (let index = 0; index < moveListBold.length; index++) {
      moveListBold[index] = 'normal';
    }

    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      moveListBold: moveListBold.concat('normal'),
      iList: iList.concat(i),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    const moveListBold = this.state.moveListBold.slice();
    for (let index = 0; index < moveListBold.length; index++) {
      if (index === step) {
        moveListBold[index] = 'bold';
      } else {
        moveListBold[index] = 'normal';
      }
    }

    this.setState({
      moveListBold: moveListBold,
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  toggleReverse() {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerList = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      let row = Math.floor(this.state.iList[move] / 3) + 1;
      let col = (this.state.iList[move] % 3) + 1;
      const desc = move
        ? 'Go to move #' + move + ' (' + row + ', ' + col + ')'
        : 'Go to game start';
      return (
        <li key={move}>
          <button
            style={{ fontWeight: this.state.moveListBold[move] }}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winnerList) {
      status = 'Winner: ' + current.squares[winnerList[0]];
    } else if (current.squares.includes(null)) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'Draw Game.';
    }

    let movesShow = moves.slice();
    if (this.state.toggle) {
      movesShow = moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winnerList={winnerList}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ul>
            <button onClick={() => this.toggleReverse()}>Reverse moves</button>
          </ul>
          <ListOrderReverse toggle={this.state.toggle} value={movesShow} />
        </div>
      </div>
    );
  }
}

// ==========================================

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}
