import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root, channel) {
  ReactDOM.render(<Game channel={channel} />, root);
}

class Game extends React.Component{
  constructor(props)  {
    super(props);
    this.channel = props.channel;
    this.state = {
      listData: trying()
    };
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  challenge_guess_your_opponent(game_name, player_name, challenge) {
    this.channel.push("join_game", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name, challenge: challenge})
      .receive("ok", this.gotView.bind(this))
  }

  gotView(view) {
    this.setState({game_list: view.game});
    console.log(this.state);
  }

  render() {
    let game_list = _.map(this.state.game_list, (game, ii) => {
      return <GameInstance game={game} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} key={ii} />;
    });
    let nums = _.map(this.state.listData, (num, ii) => {
      return <RenderList num={num} />;
    });
    return (
      <div className="row">
        <div>
          <GuessOpponentGame challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} />
          { game_list }
          </div>
      <div>
        {nums}
      </div>
      </div>
    )
  }
}

function trying() {
  var lst = [];
  for(var i = 0; i < 5; i++)
  {
    lst[i] = {value: i};
  }
  console.log(lst);
  return lst;
}

function RenderList(props) {
  let listData = props.listData;
  console.log(props.listData);
  let num = listData.value;

  return (
    <div className="col-3">
      <div>
        {num}
      </div>
    </div>
  )
}



function GuessOpponentGame(params) {
  return (
    <div className="info col-12">
    <span><p><input type="text" id="player-name" placeholder="Your Name" /></p>
      <p><input type="text" id="challenge" placeholder="Challenge Number" /></p>
      <p><input type="text" id="game-name" placeholder="New Game Name" /></p>
      <p><input type="button" onClick={() =>
        params.challenge_guess_your_opponent(document.getElementById("game-name").value,
        document.getElementById("player-name").value, document.getElementById("challenge").value)} value="Challenge" /></p></span>
    </div>
  )
}

function GameInstance(params) {
  return (<div className="col-6 game-item" onClick={() =>
    params.challenge_guess_your_opponent(params.game, document.getElementById("player-name").value, document.getElementById("challenge").value)}>
      Join {params.game}
  </div>)
}
