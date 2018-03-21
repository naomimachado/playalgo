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
      listData: trying(),
      clickedList: clickedNosList(trying())
    };
    console.log(this.state.listData);
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
    let clickednums = _.map(this.state.listData, (cnum, ii) => {
      return <RenderClickedList cnum={cnum} />;
    });
    console.log(this.state);
    return (
      <div className="rows">
        <div className="cols">
          <GuessOpponentGame challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} />
          { game_list }
        </div>
        <div className="cols">
          {nums}
        </div><br></br>
        <div className="cols">
          Clicked Numbers:
          {clickednums}
        </div>
      </div>
    )
  }
}

function trying() {
  var lst = [];
  for(var i = 0; i < 20; i++)
  {
    lst[i] = {value: i, clicked: false};
  }
  console.log(lst);
  return lst;
}

function clickedNosList(listData) {
  var clst = [];
  for(var i = 0; i < 20; i++)
  {
    if(listData[i].clicked == true)
    {
      clst = add(listData[i]);
    }
  }
  return clst;
}

function RenderList(props) {
  let listData = props.num;
  console.log(props.num);
  let num = listData.value;

  return (
    <span className="rows">
      <span id="num" onClick={()=> clickedNum(listData)}>
        {num}
      </span>
    </span>
  )
}

function RenderClickedList(props) {
  let clicked = props.cnum;
  let show = "";
  console.log("clicked",props.cnum);
  let cnum = clicked.value;
  if(cnum.clicked == true){
    show = cnum.value;
  }
    return (
      <span className="rows">
        <span id="num">
          {show}
        </span>
      </span>
    )
}

function clickedNum(listData) {
  let num = listData;
  num.clicked = true;
  console.log(num);
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
