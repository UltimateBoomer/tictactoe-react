import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/**
 * Renders squares on TTT board, given game state information.
 */
function Square(props) {
  const [isHovering, setHovering] = useState(false);

  return (
    <button
      className={`square ${props.win ? "win" : ""} ${!props.value ? "hover" : ""} ${props.type ? "a" : "b"}`}
      onClick={props.onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!props.value && isHovering && !props.complete
        ? props.currentPlayer
        : props.value}
    </button>
  );
}

/**
 * Renders TTT board given game state information.
 */
class Board extends React.Component {
  renderSquare(i, type) {
    return (
      <Square
        key={`square${i}`}
        value={this.props.squares[i]}
        win={this.props.squareWins[i]}
        currentPlayer={this.props.currentPlayer}
        complete={this.props.complete}
        type={type}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [];
    let type = false;
    for (let i = 0; i < this.props.size; i++) {
      const row = [];
      for (let j = 0; j < this.props.size; j++) {
        row.push(this.renderSquare(i * this.props.size + j, type));
        type ^= true;
      }
      rows.push(
        <div key={`row${i}`} className="board-row">
          {row}
        </div>
      );
    }
    return <div>{rows}</div>;
  }
}

/**
 * Handles TTT logic and renders the entire page.
 */
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(this.props.size ** 2),
          squareWins: Array(this.props.size ** 2),
          move: null,
        },
      ],
    };
  }

  /**
   * Reset game to starting position.
   * Done by resetting history to original state.
   */
  reset() {
    this.setState((prevState) => ({
      history: prevState.history.slice(0, 1),
    }));
  }

  /**
   * Get the current player name based on turn count.
   * @returns string
   */
  getCurrentPlayerName() {
    return this.state.history.length % 2 ? "X" : "O";
  }

  /**
   * Get the number of occupied squares on the board.
   * @param {[]} squares
   * @returns int
   */
  countUsed(squares) {
    return squares.reduce((p, c) => (c ? p + 1 : p), 0, squares);
  }

  /**
   * Produce a list of winning lines.
   * @param {[]} squares
   * @returns
   */
  getWins(squares) {
    // Generate possible winning lines based on size of board.
    const lines = [
      Array(this.props.size)
        .fill(0)
        .map((_, i) =>
          Array(this.props.size)
            .fill(0)
            .map((_, j) => i * this.props.size + j)
        ),
      Array(this.props.size)
        .fill(0)
        .map((_, i) =>
          Array(this.props.size)
            .fill(0)
            .map((_, j) => i + j * this.props.size)
        ),
      [
        Array(this.props.size)
          .fill(0)
          .map((_, i) => i * (this.props.size + 1)),
      ],
      [
        Array(this.props.size)
          .fill(0)
          .map((_, i) => this.props.size - 1 + i * (this.props.size - 1)),
      ],
    ].flat();

    return lines.filter(
      (l) =>
        squares[l[0]] && l.slice(1).every((i) => squares[i] === squares[l[0]])
    );
  }

  handleClick(i) {
    const currentSquares = this.state.history.at(-1).squares;
    if (this.getWins(currentSquares).length || currentSquares[i]) {
      return;
    }

    let newSquares = currentSquares.slice();
    newSquares[i] = this.getCurrentPlayerName();
    const newWins = this.getWins(newSquares);
    let squareWins = Array(this.props.size ** 2);
    newWins.forEach((w) => w.forEach((j) => (squareWins[j] = true)));
    // console.log(squareWins);

    this.setState((prevState) => ({
      history: prevState.history.concat([
        {
          squares: newSquares,
          squareWins: squareWins,
          move: i,
        },
      ]),
    }));
  }

  undo() {
    if (this.state.history.length > 1) {
      this.setState((prevState) => ({
        history: prevState.history.slice(0, -1),
      }));
    }
  }

  render() {
    const history = this.state.history;
    const current = history.at(-1);
    const wins = this.getWins(current.squares);
    // const used = this.countUsed(current);

    // console.log("current: ", current);

    let status;
    if (wins.length) {
      status = `${current.squares[wins[0][0]]} wins!`;
    } else if (history.length > this.props.size ** 2) {
      status = "Draw";
    } else {
      status = `${this.getCurrentPlayerName()}'s turn`;
    }

    return (
      <div className="game">
        <h1>Tic-Tac-Toe</h1>
        <div className="game-info">
          <p>{status}</p>
          <div>
            <button className="game-button" onClick={() => this.undo()}>Undo</button>
            <button className="game-button" onClick={() => this.reset()}>Reset</button>
          </div>
        </div>
        <div className="game-board">
          <Board
            size={this.props.size}
            squares={current.squares}
            squareWins={current.squareWins}
            currentPlayer={this.getCurrentPlayerName()}
            complete={wins.length > 0}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game size={3} />);
