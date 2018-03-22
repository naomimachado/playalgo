import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root, channel) {
  ReactDOM.render(<Game channel={channel} />, root);
}

class Game extends React.Component{
  constructor(props)  {
    super(props);
    this.channel = props.channel;
    this.state = {}
    this.channel.join()
    .receive("ok", resp => {
      this.state.player = resp.player;
      this.gotView(resp);
    })
    .receive("error", resp => { console.log("Unable to join", resp) });
    this.channel.on("join_game", this.gotView.bind(this));
  }

  challenge_guess_your_opponent(game_name, player_name, challenge) {
    this.channel.push("join_game", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name, challenge: challenge})
    .receive("ok", this.gotView.bind(this))
  }

  guess_guess_your_opponent(game_name, player_name, guess) {
    console.log(game_name, player_name, guess);
    this.channel.push("guess", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name, guess: guess})
      .receive("ok", resp => {
        this.gotView(resp);
      });
  }

  gotView(view) {
    this.setState({
      player: this.state.player,
      game_list: view.game.games,
      player_state: view.game.player_state,
      has_opponent: view.game.has_opponent,
      game_name: view.game.game_name
    });
    if (this.state.has_opponent) {
      console.log("update_track");
      this.update_track();
    }
    console.log(this.state);
  }

  update_track() {
    if (this.state.player_state.player_state.id == 1) {
      changePosCar(this.state.player_state.player_state.score, "car1");
      changePosCar(this.state.player_state.player_state.opponent_score, "car2");
    } else {
      changePosCar(this.state.player_state.player_state.score, "car2");
      changePosCar(this.state.player_state.player_state.opponent_score, "car1");
    }
  }


  render() {
    if (!this.state.has_opponent) {
      let game_list = _.map(this.state.game_list, (game, ii) => {
        return <GameInstance player={this.state.player} game={game} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} key={ii} />;
      });
      return (
        <div className="row">
          <h1>Guess Your Opponent: Welcome {this.state.player}</h1>
          <GuessOpponentGame player={this.state.player} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} />
          { game_list }
        </div>
      )
    } else {
      let nums = _.map(this.state.player_state.player_state.guess_list, (num, ii) => {
        return <RenderList num={num}  game_name={this.state.game_name}
  player_name={this.state.player} guess_guess_your_opponent={this.guess_guess_your_opponent.bind(this)} key={ii}/>;
      });

      let guesses = _.map(this.state.player_state.player_state.guess_list, (num, ii) => {
        return <RenderGuessList num={num} key={ii}/>;
      });

      return (
        <div className="rows flex-container">
          <div id="game-stuff">
            <div className="cols">
              Welcome player:<span>{this.state.player}</span>
          </div>
          <div className="cols cols-3">
            List of Numbers:<br></br>
            <ul>{nums}</ul>
          </div><br></br>
          <div>
            Guessed Numbers:<br></br>
            {guesses}
          </div>
        </div>
        <br></br>
        <div id="car-stuff">
          <img src="/images/1.png" id="car1"></img><img src="/images/finish.png" className="endline"></img><br></br>
          <img src="/images/2.png" id="car2"></img><img src="/images/finish.png" className="endline"></img>
        </div>
      </div>
    )
  }
}
}

function GuessOpponentGame(params) {
  return (
    <div className="info col-12">
      <span>
        <p><input type="text" id="challenge" placeholder="Challenge Number" /></p>
        <p><input type="text" id="game-name" placeholder="New Game Name" /></p>
        <p><input type="button" onClick={() =>
            params.challenge_guess_your_opponent(document.getElementById("game-name").value,
            params.player, document.getElementById("challenge").value)} value="Challenge" /></p>
        </span>
      </div>
    )
  }

  function GameInstance(params) {
    return (<div className="col-6 game-item" onClick={() =>
    params.challenge_guess_your_opponent(params.game, params.player, document.getElementById("challenge").value)}>
    Join {params.game}
  </div>)
}

function RenderList(props) {
  let listData = props.num;
  let num = listData.number;

  return (
    <span className="rows">
      <li>
        <span className="cols-3" id="num" onClick={()=> props.guess_guess_your_opponent(props.game_name, props.player_name, num)}>
          {num}
        </span>
      </li>
    </span>
  )
}

function RenderGuessList(props) {
  let listData = props.num;
  let num = listData.number;
  let click = listData.click;

  if(click === true){
    return (
      <span className="rows">
        <span id="guess">
          {num}
        </span>
      </span>
    )
  }
  else{
    return null;
  }
}

function changePosCar(value, car_id) {
  let car = document.getElementById(car_id);
  if (car) {
    let x = document.getElementById(car_id).style.right;
    if (x) {
      var newVal = value;
      document.getElementById(car_id).style.right = newVal+"px";
    } else {
      value = value + 10;
      console.log("No existing", value);
      document.getElementById(car_id).style.right = value + "px";
    }
  }
}
