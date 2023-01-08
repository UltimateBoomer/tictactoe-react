import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={`square${i}`}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />)
  }

  render() {
    const rows = []
    for (let i = 0; i < this.props.dimensions[0]; i++) {
      const row = []
      for (let j = 0; j < this.props.dimensions[1]; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      rows.push(<div key={`row${i}`} className='board-row'>{row}</div>)
    }
    return <div>{rows}</div>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(this.props.dimensions.reduce((a, b) => a * b)),
        move: null,
      }]
    }
  }

  reset() {
    this.setState(prevState => ({
      history: prevState.history.slice(0, 1)
    }))
  }

  getCurrentPlayerName() {
    return this.state.history.length % 2 ? 'X' : 'O'
  }

  getWins() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    const current = this.state.history.at(-1).squares
    return lines
      .filter(l => current[l[0]] && l.slice(1).every(i => current[i] === current[l[0]]))
      .map(l => [current[l[0]], l])
  }

  handleClick(i) {
    const current = this.state.history.at(-1).squares.slice()
    if (this.getWins().length || current[i]) {
      return
    }

    current[i] = this.getCurrentPlayerName()
    this.setState(prevState => ({ 
      history: prevState.history.concat([{
        squares: current,
        move: i,
      }])
    }))
  }

  undo() {
    if (this.state.history.length > 1) {
      this.setState(prevState => ({
        history: prevState.history.slice(0, -1)
      }))
    }
  }

  render() {
    const history = this.state.history
    const current = history.at(-1).squares
    const wins = this.getWins()

    let status
    if (wins.length) {
      status = `${wins[0][0]} wins!`
    } else {
      status = `${this.getCurrentPlayerName()}'s turn`
    }

    return (
      <div className="game">
        <h1>Tic-Tac-Toe</h1>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.undo()}>Undo</button>
          <button onClick={() => this.reset()}>Reset</button>
        </div>
        <div className="game-board">
          <Board 
            dimensions={this.props.dimensions}
            squares={current}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    )
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<Game dimensions={[3, 3]}/>)
