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
        key={i}
      />
    );
  }

  render() {
    let max_row = this.props.max_square;
    let max_col = this.props.max_square;
    let element = [],
      clr,
      bgd = 'rgb(16, 163, 189)';
    for (let i = 0; i < max_row * max_col; i += max_col) {
      let square = [];
      for (let j = 0; j < max_col; j++) {
        if (this.props.winnerArray && this.props.winnerArray.includes(i + j)) {
          clr = 'rgb(223, 54, 82)';
          bgd = 'yellow';
        } else if (this.props.squares[i + j] === 'O') {
          clr = 'black';
          bgd = 'rgb(16, 163, 189)';
        } else if (this.props.squares[i + j] === 'X') {
          clr = 'yellow';
          bgd = 'rgb(16, 163, 189)';
        } else {
          clr = 'black';
          bgd = 'rgb(16, 163, 189)';
        }
        square.push(this.renderSquare(i + j, clr, bgd));
      }
      element.push(
        <div key={i} className="board-row">
          {square}
        </div>
      );
    }
    return <div>{element}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      max_square: 10,
      history: [
        {
          squares: Array(15 * 15).fill(null)
        }
      ],
      moveListBold: ['normal'],
      iList: [0],
      xIsNext: true,
      stepNumber: 0,
      toggle: false
    };
  }
  componentWillMount() {
    let max_square = 15;
    let width = window.innerWidth;
    if (width <= 510) {
      max_square = 5;
    } else if (width <= 800) {
      max_square = 10;
    }
    this.listener = window.addEventListener('resize', () => {
      width = window.innerWidth;
      if (this.state.iList.length === 1) {
        if (width <= 510) {
          max_square = 5;
        } else if (width <= 800) {
          max_square = 10;
        } else {
          max_square = 15;
        }
        this.setState({
          max_square: max_square,
          history: [
            {
              squares: Array(max_square * max_square).fill(null)
            }
          ],
          moveListBold: ['normal'],
          iList: [0],
          xIsNext: true,
          stepNumber: 0,
          toggle: false
        });
      }
    });

    this.setState({
      max_square: max_square,
      history: [
        {
          squares: Array(max_square * max_square).fill(null)
        }
      ]
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.listener);
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
    let max_row = this.state.max_square;
    let max_col = this.state.max_square;

    if (
      calculateWinner(iList[this.state.stepNumber], max_row, max_col, squares)
    ) {
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

  restartGame() {
    let max_square;
    const width = window.innerWidth;

    if (width <= 510) {
      max_square = 5;
    } else if (width <= 800) {
      max_square = 10;
    } else {
      max_square = 15;
    }
    this.setState({
      max_square: max_square,
      history: [
        {
          squares: Array(max_square * max_square).fill(null)
        }
      ],
      moveListBold: ['normal'],
      iList: [0],
      xIsNext: true,
      stepNumber: 0,
      toggle: false
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const currentI = this.state.iList[this.state.iList.length - 1];
    let max_row = this.state.max_square;
    let max_col = this.state.max_square;
    const winnerArray = calculateWinner(
      currentI,
      max_row,
      max_col,
      current.squares
    );

    let moves = history.map((step, move) => {
      let row = Math.floor(this.state.iList[move] / max_col) + 1;
      let col = (this.state.iList[move] % max_col) + 1;
      const desc = move
        ? 'Go to move #' + move + ' (' + row + ', ' + col + ')'
        : 'Go to game start';
      return (
        <li key={move}>
          <button
            className="move-list"
            style={{ fontWeight: this.state.moveListBold[move] }}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });
    moves.shift();

    let status;
    if (winnerArray) {
      status = 'Winner: ' + current.squares[winnerArray[0]];
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
            winnerArray={winnerArray}
            max_square={this.state.max_square}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ul>
            <button onClick={() => this.toggleReverse()}>Reverse moves</button>
          </ul>
          <ul>
            <button onClick={() => this.restartGame()}>Restart Game</button>
          </ul>
          <ListOrderReverse toggle={this.state.toggle} value={movesShow} />
        </div>
      </div>
    );
  }
}

// ==========================================

ReactDOM.render(<Game />, document.getElementById('root'));

/*param: 
        i: Last cliked button index of the squares array;
        max_row: Maximum rows of grid;
        max_col: Maximum columns of grid;
        squares: The square Components array.*/
function calculateWinner(i, max_row, max_col, squares) {
  let winnerArray = null;
  function findUp(i) {
    return i - max_col >= 0 ? i - max_col : null;
  }

  function findDown(i) {
    return i + max_col < max_col * max_row ? i + max_col : null;
  }

  function findLeft(i) {
    return i % max_col === 0 ? null : i - 1;
  }

  function findRight(i) {
    return i % max_col < max_col - 1 ? i + 1 : null;
  }

  function findUpLeft(i) {
    let n = findUp(i);
    return n ? findLeft(n) : null;
  }

  function findDownRight(i) {
    let n = findDown(i);
    return n ? findRight(n) : null;
  }

  function findUpRight(i) {
    let n = findUp(i);
    return n ? findRight(n) : null;
  }

  function findDownLeft(i) {
    let n = findDown(i);
    return n ? findLeft(n) : null;
  }

  function calcwinnerArray(forward, backward) {
    let tmpArray = [i];
    let count = 1;
    function findCount(next) {
      let n = i;
      for (let j = 0; j < 4; j++) {
        n = next(n);
        if (n !== null && squares[n] && squares[n] === squares[i]) {
          count++;
          tmpArray.push(n);
        } else {
          break;
        }
      }
    }

    findCount(forward);
    findCount(backward);
    if (count >= 5) {
      winnerArray = tmpArray.slice();
      return true;
    } else {
      return false;
    }
  }
  if (
    calcwinnerArray(findUp, findDown) ||
    calcwinnerArray(findLeft, findRight) ||
    calcwinnerArray(findUpLeft, findDownRight) ||
    calcwinnerArray(findUpRight, findDownLeft)
  ) {
    return winnerArray;
  } else {
    return null;
  }
}
