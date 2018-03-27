import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root, channel) {
  document.body.style.backgroundImage = "";
  ReactDOM.render(<Game channel={channel} />, root);
}

class Game extends React.Component{
  constructor(props)  {
    super(props);
    this.channel = props.channel;
    this.state = {
      isHidden: true,
      chatHidden: true,
    }
    this.channel.join()
    .receive("ok", resp => {
       this.state.player = resp.player;
       if (resp.view){
         this.gotViewer(resp);
       } else {
         this.gotView(resp);
       }
       this.leaderboard();
       this.init_chat();
    })
    .receive("error", resp => { console.log("Unable to join", resp) });
    this.channel.on("join_game", resp => {
      if (!this.has_opponents && this.state.game_name == resp.game.game_name) {
      	this.gotView(resp);
      }
    });
    this.channel.on("guess", resp => {
      if(this.state.view) {
        this.gotViewer(resp);
      }
      if (this.state.game_name == resp.game.game_name) {
        this.gotView(resp);
      }
    });
    this.channel.on("shout", this.gotChat.bind(this));
  }

//Attribution: https://eddyerburgh.me/toggle-visibility-with-react
  toggleHidden () {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }

  chatHidden () {
    this.setState({
      chatHidden: !this.state.chatHidden
    });
  }

  challenge_guess_your_opponent(game_name, player_name, challenge) {
    if (game_name !=""  && challenge != "") {
      this.channel.push("join_game", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name, challenge: challenge})
        .receive("ok", this.gotView.bind(this))
    } else {
      alert("Error Message: Challenge or Player Name is empty/ Values are incorrect");
    }
  }

  get_game_guess_your_opponent(game_name, player_name) {
    this.channel.push("join_game", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name})
    .receive("ok", this.gotView.bind(this))
  }

  guess_guess_your_opponent(game_name, player_name, guess) {
    this.channel.push("guess", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name, guess: guess})
      .receive("ok", resp => {
        this.gotView(resp);
      });
  }

  view_game(game_name, player_name) {
    this.channel.push("view_game", {game_channel: "guess_your_opponent", game_name: game_name, player_name: player_name})
      .receive("ok", resp => {
        this.gotViewer(resp);
      });
  }

  leaderboard() {
    this.channel.push("leaderboard", {game_channel: "guess_your_opponent"})
      .receive("ok", resp => {
        this.state.leaderboard = resp.leaderboard
        this.setState(this.state);
      });
  }

  gotView(view) {
    if (view.game.player_state) {
    this.setState({
        player: this.state.player,
        game_list: view.game.games,
        my_games: view.game.my_games,
        player_state: view.game.player_state,
        has_opponent: view.game.has_opponent,
        game_name: view.game.game_name
      });
    } else {
      this.setState({
        player: this.state.player,
        game_list: view.game.games,
        my_games: view.game.my_games,
        player_state: null,
        has_opponent: false,
        game_name: ""
      });
    }
    if(view.result) {
      this.state.result = view.result;
      this.setState(this.state);
    }
    if(view.game.winner){
      this.state.winner = view.game.winner;
      this.setState(this.state);
    }
    if (this.state.has_opponent) {
      this.update_track();
      this.setState(this.state);
    }
  }

  gotViewer(view){
    this.setState(
      {
        view: view.view
      }
    )
    if(view.view.winner){
      this.state.winner = view.view.winner;
      this.setState(this.state);
    }
    if(this.state.view.viewer_state) {
      this.update_track_viewer();
      this.setState(this.state);
    }
  }

  gotChat(chat){
    this.state.chat = chat.chat;
    this.setState(this.state);
  }

  update_track_viewer() {

    changePosCar(this.state.view.viewer_state.player1_state.player_state.score, "car1");
    changePosCar(this.state.view.viewer_state.player2_state.player_state.score, "car2");

    if(this.state.winner && this.state.winner == this.state.view.viewer_state.player1_state.player_state.name){
      document.getElementById("car1").style.right = "87.5%";
    }
    if(this.state.winner && this.state.winner == this.state.view.viewer_state.player2_state.player_state.name){
      document.getElementById("car2").style.right = "87.5%";
    }
  }

  update_track() {
    if (this.state.player_state.player_state.id == 1) {
      changePosCar(this.state.player_state.player_state.score, "car1");
      changePosCar(this.state.player_state.player_state.opponent_score, "car2");
    } else {
      changePosCar(this.state.player_state.player_state.score, "car2");
      changePosCar(this.state.player_state.player_state.opponent_score, "car1");
    }
    if(this.state.winner && this.state.winner == this.state.player){
      if (this.state.player_state.player_state.id == 1) {
        document.getElementById("car1").style.right = "87.5%";
      }
      else {
        document.getElementById("car2").style.right = "87.5%";
      }
    }
    if (this.state.winner && this.state.winner == this.state.player_state.player_state.opponent_name){
      if (this.state.player_state.player_state.id == 1) {
        document.getElementById("car2").style.right = "87.5%";
      }
      else {
        document.getElementById("car1").style.right = "87.5%";
      }
    }
  }

  init_chat() {
    this.channel.push("chat", {game_channel: "guess_your_opponent"})
      .receive("ok", resp => {
        this.state.chat = resp.chat
        this.setState(this.state);
    });
  }

//Attribution: https://elixircasts.io/chat-room-in-8-minutes

  listenForChats() {
      let userName = document.getElementById('user-name').value
      let userType = document.getElementById('user-type').value
      let userMsg = document.getElementById('user-msg').value

      this.channel.push("shout", {game_channel: "guess_your_opponent", name: userName, type: userType, body: userMsg})

      document.getElementById('user-msg').value = ''
    }


  render() {
    //viewer stuff
    if(this.state.view){

      //when a game is selected to view
      if (this.state.view.viewer_state) {
        let player1_list = _.map(this.state.view.viewer_state.player1_state.player_state.guessed, (num, ii) => {
          return <RenderGuessList num={num} key={ii}/>;
        });
        let player2_list = _.map(this.state.view.viewer_state.player2_state.player_state.guessed, (num, ii) => {
          return <RenderGuessList num={num} key={ii}/>;
        });

        let winner="";

        if(this.state.winner){
          winner = this.state.winner;

        return(
          <div className="rows flex-container">
              <h1>&nbsp;Guess Your Opponent: Welcome viewer {this.state.player}</h1>
              <h4>&nbsp;Game name: {this.state.view.game_name}</h4>
              <h4>&nbsp;Game Winner:{winner}</h4>
              <h5>&nbsp;Player 1: {this.state.view.viewer_state.player1_state.player_state.name}<span><Avatar car={1}/></span></h5>
              <h5>&nbsp;Guess List:<ul className="g-list">{player1_list}</ul></h5>
              <h5>&nbsp;Clicks: {this.state.view.viewer_state.player1_state.player_state.clicks}</h5>
              <h5>&nbsp;Score:{this.state.view.viewer_state.player1_state.player_state.score}</h5>
                <div id="car-stuff1">
                  <img src="/images/1.png" id="car1"></img><img src="/images/finish.png" className="endline"></img><br></br>
                  <img src="/images/2.png" id="car2"></img><img src="/images/finish.png" className="endline"></img>
                </div>
              <h5>&nbsp;Player 2: {this.state.view.viewer_state.player2_state.player_state.name}<span><Avatar car={2}/></span></h5>
              <h5>&nbsp;Guess List:<ul className="g-list">{player2_list}</ul></h5>
              <h5>&nbsp;Clicks: {this.state.view.viewer_state.player2_state.player_state.clicks}</h5>
              <h5>&nbsp;Score:{this.state.view.viewer_state.player2_state.player_state.score}</h5>
              <input type="button" className="btn btn-primary gradient" onClick={() => window.location.reload()} value="View Other Games" />
          </div>)
        }
        else{
          return(
            <div className="rows flex-container">
                <h1>&nbsp;Guess Your Opponent: Welcome viewer {this.state.player}</h1>
                <h4>&nbsp;Game name: {this.state.view.game_name}</h4>
                <h5>&nbsp;Player 1: {this.state.view.viewer_state.player1_state.player_state.name}<span><Avatar car={1}/></span></h5>
                <h5>&nbsp;Guess List:</h5><ul className="g-list">{player1_list}</ul>
                <h5>&nbsp;Clicks: {this.state.view.viewer_state.player1_state.player_state.clicks}</h5>
                <h5>&nbsp;Score:{this.state.view.viewer_state.player1_state.player_state.score}</h5>
                  <div id="car-stuff1">
                    <div className="bg">
                      <img src="/images/1.png" id="car1"></img><img src="/images/finish.png" className="endline"></img><br></br>
                      <img src="/images/2.png" id="car2"></img><img src="/images/finish.png" className="endline"></img>
                    </div>
                  </div>
                <h5>&nbsp;Player 2: {this.state.view.viewer_state.player2_state.player_state.name}<span><Avatar car={2}/></span></h5>
                <h5>&nbsp;Guess List:</h5><ul className="g-list">{player2_list}</ul>
                <h5>&nbsp;Clicks: {this.state.view.viewer_state.player2_state.player_state.clicks}</h5>
                <h5>&nbsp;Score:{this.state.view.viewer_state.player2_state.player_state.score}</h5>
                <input type="button" className="btn btn-primary gradient back-games" onClick={() => window.location.reload()} value="View Other Games" />
            </div>)
        }
      } else {

        //display games to view
        let view_list = _.map(this.state.view.games, (game, ii) => {
          return <GameInstance player={this.state.player} game={game} view_game={this.view_game.bind(this)} key={ii} />;
        });


        let leader_list = _.map(this.state.leaderboard, (leader, ii) => {
          return <LeaderBoard leader={leader} rank={leader.rank} key={ii} />;
        });

        return(
          <div className="row flex-container">
              <h1>&nbsp; Guess Your Opponent: Welcome {this.state.player}</h1>
              <div className="views">
                <div>
                  <button onClick={this.chatHidden.bind(this)} className="btn btn-primary gradient">
                    Click to view Chat Box
                  </button>
                  {!this.state.chatHidden && <ChatBox chat={this.state.chat} view={this.state.player} listenForChats={this.listenForChats.bind(this)}/>}
                </div><br/>
                <h5>&nbsp; View Games</h5>
                <div>{view_list}</div>
              </div>
              <h2 className="inline2">Leader Board</h2>
            <table className="inline1 table-style-three">
              <tbody>
                <Heading/>
                {leader_list}
              </tbody>
            </table>
          </div>)
      }
    } else {

      //player stuff

      //when player has no opponent
    if (!this.state.has_opponent) {
      if(!this.state.player_state){

        let game_list = _.map(this.state.game_list, (game, ii) => {
          return <GameInstance player={this.state.player} game={game} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} key={ii} />;
        });

        let my_game_list = _.map(this.state.my_games, (game, ii) => {
          return <GameInstance player={this.state.player} game={game} get_game_guess_your_opponent={this.get_game_guess_your_opponent.bind(this)} key={ii} />;
        });

        let leader_list = _.map(this.state.leaderboard, (leader, ii) => {
          return <LeaderBoard leader={leader} rank={leader.rank} key={ii} />;
        });

        return (
          <div className="row flex-container">
            <h1>&nbsp; Guess Your Opponent: Welcome {this.state.player}</h1>
            <table className="inline disp-table1">
              <tbody>
                <tr>
                  <td><button onClick={this.toggleHidden.bind(this)} className="btn btn-primary gradient" >
                    Click to View Rules
                  </button>
                {!this.state.isHidden && <RuleList />}</td>
                </tr>
                <tr>
                  <td>
                    <button onClick={this.chatHidden.bind(this)} className="btn btn-primary gradient">
                      Click to view Chat Box
                    </button>
                    {!this.state.chatHidden && <ChatBox chat={this.state.chat} name={this.state.player} listenForChats={this.listenForChats.bind(this)}/>}
                  </td>
                </tr>
                <tr>
                <td>
                  <GameInfo />
                  <GuessOpponentGame player={this.state.player} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} />
                    <h5>&nbsp; My Games:</h5>
                    { my_game_list }
		    <br></br>
                    <JoinInfo />
                    <GuessOpponentGame player={this.state.player} challenge_guess_your_opponent={this.challenge_guess_your_opponent.bind(this)} existing={true} />
                    <h5>&nbsp; Existing Games:</h5>
                    <h6>&nbsp; <b>(Refresh to see latest games)</b></h6>
                    { game_list }
                </td>
            </tr>
              </tbody>
            </table>
            <h2 className="inline2">Leader Board</h2>
            <table className="inline1 table-style-three">
              <tbody>
                <Heading />
                {leader_list}
              </tbody>
            </table>
          </div>)
        } else {
          //when player has created a game and waiting for other player to join
          let leader_list1 = _.map(this.state.leaderboard, (leader, ii) => {
            return <LeaderBoard leader={leader} rank={leader.rank} key={ii} />;
          });

          return (
            <div className="row flex-container">
              <h1>&nbsp; Guess Your Opponent: Welcome {this.state.player}</h1>
              <h1 id="wait" className="disp">&nbsp;Waiting for opponent to join........</h1>
              <div  className="disp-table">
                <div>
                  <p><br/>Ask other players to join your game in the Chat Box </p>
                  <p>Game Name: {this.state.game_name}</p>
                  <button onClick={this.chatHidden.bind(this)} className="btn btn-primary gradient">
                    Click to view Chat Box
                  </button>
                  {!this.state.chatHidden && <ChatBox chat={this.state.chat} name={this.state.player} listenForChats={this.listenForChats.bind(this)} />}
                </div>
                <RuleList />
              </div>
            </div>)
          }
    } else {
      let nums = _.map(this.state.player_state.player_state.guess_list, (num, ii) => {
        return <RenderList num={num}  game_name={this.state.game_name}
          player_name={this.state.player} guess_guess_your_opponent={this.guess_guess_your_opponent.bind(this)} key={ii}/>;
        });

        let guesses = _.map(this.state.player_state.player_state.guessed, (num, ii) => {
          return <RenderGuessList num={num} key={ii}/>;
        });

        //when a player wins
      if( this.state.winner){
        return (
          <div className="rows flex-container">
            <div id="car-stuff1">
              <img src="/images/1.png" id="car1"></img><img src="/images/finish.png" className="endline"></img><br></br>
              <img src="/images/2.png" id="car2"></img><img src="/images/finish.png" className="endline"></img>
            </div>
            <div id="game-stuff">
              <div className="cols">
                &nbsp;Winner is:<span>{this.state.winner}</span>
            </div>
            <div>
              &nbsp;Guesses in this round:
              <br/>
              <ul className="g-list">{guesses}</ul>
              <GameStats state={this.state}/>
            </div>&nbsp;
            <input type="button" className="btn btn-primary gradient" onClick={() => window.location.reload()} value="New Game" />
          </div>
        </div>
        )
      } else {
        //when both players are playing
      return (
        <div className="rows flex-container">
          <div id="car-stuff">
            <div className="bg">
              <img src="/images/1.png" id="car1"></img><img src="/images/finish.png" className="endline"></img><br></br>
              <img src="/images/2.png" id="car2"></img><img src="/images/finish.png" className="endline"></img>
            </div>
          </div>
          <div id="game-stuff">
            <div className="cols">
              &nbsp;Welcome player:<span>{this.state.player}</span><span><Avatar car={this.state.player_state.player_state.id}/></span>
          </div>
          <div className="cols cols-3">
            &nbsp;List of Numbers:
            <ul className="game">{nums}</ul>
          </div>
          <div>
            <ul className="g-list">&nbsp;Guessed Numbers:{guesses}</ul>
          </div>
        </div>
      </div>
    )
  }
}
}
}
}

function Avatar(params){
let car=params.car;

if(car == 1){
  return (<img src="/images/1.png" className="smallcar"></img>)
} else {
  return (<img src="/images/2.png" className="smallcar"></img>)
}
}

function GuessOpponentGame(params) {
  if (!params.existing) {
    return (
      <div className="info col-12">
        <span>
          <p><input type="number" id="challenge" placeholder="Challenge Number" /></p>
          <p><input type="text" id="game-name" placeholder="New Game Name" /></p>
          <p><input type="button" className="btn btn-primary gradient" onClick={() =>
            params.challenge_guess_your_opponent(document.getElementById("game-name").value,
            params.player, document.getElementById("challenge").value)} value="Challenge" /></p>
        </span>
      </div>
    )
    } else {
      return (
      <div className="info col-12">
        <span><p><input type="number" id="challenge-existing" placeholder="Challenge Number" /></p></span>
      </div>
    )
    } 
  }

  function GameInstance(params) {
    if(params.challenge_guess_your_opponent) {
      return (<div className="col-6 game-item" onClick={() =>
      params.challenge_guess_your_opponent(params.game, params.player, document.getElementById("challenge-existing").value)}>
      Join {params.game}
    </div>)
  } else if (params.get_game_guess_your_opponent) {
    return (<div className="col-6 game-item" onClick={() =>
      params.get_game_guess_your_opponent(params.game, params.player)}>
      Go to {params.game}
    </div>)
  } else {
    return (<div className="col-6 game-item" onClick={() =>
    params.view_game(params.game, params.player)}>
    {params.game}
    </div>)
  }
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
  let num = props.num;
  return (
    <span className="rows">
      <span id="guess">
        {num.number}({num.result})
      </span>
    </span>
  )
}

function changePosCar(value, car_id) {
  let car = document.getElementById(car_id);
  if (car) {
    let x = document.getElementById(car_id).style.right;
    if (x) {
      document.getElementById(car_id).style.right = value + "px";
    } else {
      value = value + 1;
      document.getElementById(car_id).style.right = value + "px";
    }
  }
}

function GameInfo(){
  return(
    <table>
      <tbody>
        <tr>
          <th><b>&nbsp;How to join:</b></th>
        </tr>
        <tr>
          <td>
            &nbsp;You can join any of the existing games(if any)<br/> &nbsp;or Issue a new game challenge!
          </td>
        </tr>
        <tr>
          <td>
            <b>&nbsp;To start a new Game:</b>
          </td>
        </tr>
        <tr>
          <td>
            &nbsp;Enter a challenge number for your opponent to guess.
          </td>
        </tr>
        <tr>
          <td>
            &nbsp;Now, enter a new game name and click on challenge <br/>&nbsp;(You have to wait for another player to join your game.<br/>&nbsp;Feel free to send a message on the chat box stating your game name<br/>&nbsp;and ask others to join.)
          </td>
        </tr>
    </tbody>
  </table>
  )
}

function JoinInfo() {
  return (
    <table>
      <tbody>
        <tr>
          <td>
            <b>&nbsp;To join an existing Game:</b>
          </td>
        </tr>
        <tr>
          <td>
            &nbsp;Enter a challenge number for your opponent to guess.
          </td>
        </tr>
        <tr>
          <td>
            &nbsp;And click on the game you want to join <br/> &nbsp;from the exisitng game list.
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function RuleList() {
  return(
    <table>
      <tbody>
      <tr>
        <th>&nbsp; RULES:</th>
      </tr>
      <tr>
        <td>&nbsp;1. You have to challenge your opponent with a number <br/>&nbsp; and you will guess the number choosen by your opponent <br/> &nbsp; from the list of numbers.</td>
      </tr>
      <tr>
        <td>&nbsp;2. To guess the challenged number, click on a tile from the<br/>&nbsp; list of numbers.<br/>&nbsp; (You can click only one tile at a time) </td>
      </tr>
      <tr>
        <td>&nbsp;3. For each guess you will get a clue about your <br/> &nbsp; distance from the number challenged by your opponent.</td>
      </tr>
      <tr>
        <td>&nbsp;4. The <b>clues</b> will be like </td>
      </tr>
      <tr>
        <td>&nbsp; a) very_high => Your guess is very large than <br/> &nbsp; the number.
        </td>
      </tr>
      <tr>
        <td>&nbsp; b) very_low => Your guess is very small than <br/> &nbsp; the number.
        </td>
      </tr>
      <tr>
        <td>&nbsp; c) high => Your guess is just large than the number.
        </td>
      </tr>
      <tr>
        <td>&nbsp; d) low => Your guess is just small than the number.
        </td>
      </tr>
      <tr>
        <td> &nbsp; e) match => Your guess is correct.
        </td>
      </tr>
      <tr>
        <td>&nbsp;5. For every guess, your car will move forward <br/> &nbsp; based on how close your guess is to the challenged number.
        </td>
      </tr>
      <tr>
        <td>&nbsp;6. The game ends when one of the players guesses <br/> &nbsp; the challenged number correctly.
        </td>
      </tr>
        <tr>
          <td><b>&nbsp;Hint:</b>
          </td>
        </tr>
        <tr>
          <td> <i>&nbsp; To get higher rank on the leaderboard, try to click as minimum tiles<br/> &nbsp; as possible.</i>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function GameStats(params){
  return(
    <table>
    <tbody>
      <tr><td>&nbsp;Game Name:</td><td>{params.state.game_name}</td></tr>
      <tr><td>&nbsp;Name:</td><td>{params.state.player}<span><Avatar car={params.state.player_state.player_state.id}/></span></td></tr>
        <tr><td>&nbsp;Opponent's Name:</td><td>{params.state.player_state.player_state.opponent_name}</td></tr>
        <tr><td>&nbsp;Your score:</td><td>{params.state.player_state.player_state.score}</td></tr>
        <tr><td>&nbsp;Opponent's Score:</td><td>{params.state.player_state.player_state.opponent_score}</td></tr>
      <tr><td>&nbsp;Clicks:</td><td>{params.state.player_state.player_state.clicks}</td></tr>
    </tbody></table>
  )
}

function LeaderBoard(params) {
  let value = Object.values(params.leader)[0];
  let points = value.points.toFixed(2);
  return(
    <tr>
      <td>
        {params.rank}
      </td>
      <td>
        {value.player_name}
      </td>
      <td>
        {value.played}
      </td>
      <td>
        {value.wins}
      </td>
      <td>
        {value.score}
      </td>
      <td>
        {points}
      </td>
    </tr>
  )

}

function Heading() {
  return(
    <tr>
      <th>
        Rank
      </th>
      <th>
        Player Name
      </th>
      <th>
        Games
      </th>
      <th>
        Wins
      </th>
      <th>
        Score
      </th>
      <th>
        Points
      </th>
    </tr>
  )
}

function ChatBox(params) {
  let info = "";

  let chat_list = _.map(params.chat, (chat, ii) => {
    return <Chat player_name={chat.player_name} type={chat.type} body={chat.body} key={ii} />;
  });

  if(params.name){
    info = "player";

  return (
    <div>
      Chat Box
      <div id="chat-box">
        {chat_list}
      </div>
      <form id="chat-form">
        <input type="hidden" id="user-name" value={params.name}></input>
        <input type="hidden" id="user-type" value="player"></input>
        <div>UserName:{params.name}</div>
        <textarea placeholder="Your comment" id="user-msg"></textarea><br></br>
        <input type="button" onClick={()=> params.listenForChats()} value="Post" className="btn btn-primary gradient"></input>
      </form>
    </div>
  )
}

if(params.view){
  info = "viewer"

  return (
    <div>
      Chat Box
      <div id="chat-box">
        {chat_list}
      </div>
      <form id="chat-form">
        <input type="hidden" id="user-name" value={params.view}></input>
        <input type="hidden" id="user-type" value="viewer"></input>
        <div>UserName:{params.view}</div>
        <textarea placeholder="Your comment" id="user-msg"></textarea>
        <input type="button" onClick={()=> params.listenForChats()} value="Post" className="btn btn-primary gradient"></input>
      </form>
    </div>
  )
}

}

function Chat(params){
  return(
    <p><b>{params.player_name}({params.type}):</b>{params.body}</p>
  )
}
