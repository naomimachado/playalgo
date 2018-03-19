import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root, channel) {
  ReactDOM.render(<GuessOpponentGame channel={channel} />, root);
}

class GuessOpponentGame extends React.Component{
  constructor(props)  {
    super(props);
    this.channel = props.channel;
    this.state = {}
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  gotView(view) {
    this.setState(view.game);
    console.log(view.game);
  }
  
  render() {
    return (
      <div className="row">
        <div className="col-6">
          <ChallengeInput challenge={this.challenge.bind(this)} />
        </div>
      </div>
    )
  }

  challenge(player_name, challenge) {
    this.channel.push("challenge", {player_name: player_name, challenge: challenge})
      .receive("ok", this.gotView.bind(this))
  }
}

function ChallengeInput(params) {
  return <div>
    <span><p><input type="text" id="challenge" placeholder="Challenge Number" /></p>
      <p><input type="text" id="player-name" placeholder="Your Name" /></p>
      <p><input type="button" onClick={() => params.challenge(document.getElementById("player-name").value, document.getElementById("challenge").value)} value="Start" /></p></span>
  </div>
}
