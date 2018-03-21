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
    };
    console.log(this.state);
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
    //console.log(this.state);
  }

  clicked(num){
    let addToList = {number: num, clicked: true};
    console.log(addToList);
    let newList = addingToList(addToList, this.state.player_state.guess_list);
    //let newHintList = checkMatch(this.state.target, newList);
    this.setState({this.state.player_state.guess_list: newList});
  }


  render() {
    let nums = _.map(this.state.player_state.guess_list, (num, ii) => {
      return <RenderList num={num} clicked={this.clicked.bind(this)} key={ii}/>;
    });
    //console.log(this.state);
    return (
      <div className="rows">
        <div className="cols">
          {nums}
        </div><br></br>
      </div>
    )
  }
}

function addingToList(numObj, exisitingList) {
  console.log(exisitingList);
  let numVal = numObj.number;
  let exist = 0;
  console.log(numVal);
  for( var i = 0; i < exisitingList.length; i++){
    console.log("for loop");
    if((exisitingList[i].number === numVal) && (exisitingList[i].clicked === false)){
      console.log(exisitingList[i].number);
      exisitingList[i].clicked = true;
    }
  }
  return exisitingList;
}


function RenderList(props) {
  let listData = props.num;
  //console.log(props.num);
  let num = listData.number;

  return (
    <span className="rows">
      <span id="num" onClick={()=> props.clicked(num)}>
        {num}
      </span>
    </span>
  )
}
