import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root, channel) {
  ReactDOM.render(<GuessOpponentGame channel={channel} />, root);
}

class GuessOpponentGame extends React.Component{
  constructor(props)  {
    console.log("hi");
    super(props);
    this.channel = props.channel;
    this.state = {
    }
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
  }

  gotView(view) {
    this.setState({
      guesses: view.game.guesses,
    });
    console.log(this.state);
  }
  
  render() {
    return (
      <div>
        <p></p>
      </div>
    )
  }
}
