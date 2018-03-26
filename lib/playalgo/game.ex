defmodule Playalgo.Game do
  alias Playalgo.GuessYourOpponent
  alias Playalgo.Leaderboard

  def new do
    %{
      guess_your_opponent: %{
      }, sort_attack: %{
      }, organize_my_cheatsheet: %{
      }
    }
  end

  defp get_player_state_helper_guess_your_opponent(game, games, rem, player_name, game_name, player_state) when rem == 0 do
    {game_name, player_state}
  end

  defp get_player_state_helper_guess_your_opponent(game, games, rem, player_name, game_name, player_state) when player_state != nil do
    {game_name, player_state}
  end

  defp get_player_state_helper_guess_your_opponent(game, games, rem, player_name, game_name, player_state) do
    cur_g = game.guess_your_opponent[(hd games)]
    get_player_state_helper_guess_your_opponent(game, (tl games),
      rem - 1, player_name, (hd games),
      Playalgo.GuessYourOpponent.get_player_state(cur_g, player_name))
  end

  defp get_player_state(game, games, game_channel, player_name) when game_channel == "guess_your_opponent" do
    get_player_state_helper_guess_your_opponent(game, games, length(games), player_name, "", nil)
  end

  defp get_player_game_state(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
    Playalgo.GuessYourOpponent.get_player_state(game.guess_your_opponent[game_name], player_name)
  end

  defp get_viewer_state(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
    Playalgo.GuessYourOpponent.get_viewer_state(game.guess_your_opponent[game_name], player_name)
  end

  defp player_games(game, game_channel, player_name) when game_channel == "guess_your_opponent" do
    Enum.filter Map.keys(game.guess_your_opponent), fn(x) ->
        has_player(game, game_channel, x, player_name)
    end
  end

  defp joinable_games(game, game_channel) when game_channel == "guess_your_opponent" do
    Enum.filter Map.keys(game.guess_your_opponent), fn(x) ->
	!has_opponent(game, game_channel, x)
    end
  end

  defp all_games(game, game_channel) when game_channel == "guess_your_opponent" do
    Map.keys(game.guess_your_opponent)
  end

  defp new_game(game, game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
     new_g = Playalgo.GuessYourOpponent.challenge(Playalgo.GuessYourOpponent.new(), player_name, challenge)
     Map.put_new(game.guess_your_opponent, game_name, new_g)
  end

  defp cur_game(game, game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
    cur_g = Playalgo.GuessYourOpponent.challenge(game.guess_your_opponent[game_name], player_name, challenge)
    Map.put(game.guess_your_opponent, game_name, cur_g)
  end

  def has_player(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
    if game_name == "" do
      false
    else
      Playalgo.GuessYourOpponent.has_player(game.guess_your_opponent[game_name], player_name)
    end
  end

  def has_opponent(game, game_channel, game_name) when game_channel == "guess_your_opponent" do
    if game_name == "" do
      false
    else
      Playalgo.GuessYourOpponent.has_opponent(game.guess_your_opponent[game_name])
    end
  end

  def get_opponent_name(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
    if has_opponent(game, game_channel, game_name) do
      Playalgo.GuessYourOpponent.get_opponent_name(game.guess_your_opponent[game_name], player_name)
    else
     ""
    end
  end

  def client_view(game, game_channel, game_name, player_name) do
    games = joinable_games(game, game_channel)
    %{
      games: games,
      my_games: player_games(game, game_channel, player_name),
      has_opponent: has_opponent(game, game_channel, game_name),
      player_state: get_player_game_state(game, game_channel, game_name, player_name),
      game_name: game_name,
      winner: game.guess_your_opponent[game_name][:winner]
    }
  end

  def client_view(game, game_channel, player_name) do
    games = joinable_games(game, game_channel)
    #{game_name, player_state} = get_player_state(game, all_games(game, game_channel), game_channel, player_name)
    %{
      games: games,
      my_games: player_games(game, game_channel, player_name),
      player_state: nil,#player_state,
      has_opponent: false,#has_opponent(game, game_channel, game_name),
      game_name: "",#game_name,
      winner: nil#game.guess_your_opponent[game_name][:winner]
    }
  end

  def viewer_view(game, game_channel, game_name, player_name) do
    games = all_games(game, game_channel)
    %{
      games: games,
      viewer_state: get_viewer_state(game, game_channel, game_name, player_name),
      winner: game.guess_your_opponent[game_name][:winner],
      game_name: game_name
    }
  end

  def viewer_view(game, game_channel, player_name) do
    games = all_games(game, game_channel)
    %{
      games: games,
    }
  end

  def join(game, game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
    if Map.has_key?(game.guess_your_opponent, game_name) do
      cur_g = cur_game(game, game_channel, game_name, player_name, challenge)
      Map.put(game, :guess_your_opponent, cur_g)
    else
      new_g = new_game(game, game_channel, game_name, player_name, challenge)
      Map.put(game, :guess_your_opponent, new_g)
    end
  end

  def guess(game, game_channel, game_name, player_name, guess) when game_channel == "guess_your_opponent" do
    {res, new_state} = Playalgo.GuessYourOpponent.guess(game.guess_your_opponent[game_name], player_name, guess)
    if res == "match" do
      new_state = Map.put(new_state, :winner, player_name)
    end
    guess_your_opponent_state = Map.put(game.guess_your_opponent, game_name, new_state)
    {res, Map.put(game, :guess_your_opponent, guess_your_opponent_state)}
  end

  def view(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
    game
  end

  def leaderboard(game, game_channel) when game_channel == "guess_your_opponent" do
    leaderboard = Playalgo.Leaderboard.leaderboard(game, game_channel, all_games(game, game_channel))
    Enum.reverse(leaderboard)
  end

  #def add_to_chat(game_channel, name, type, body) do
  #  data = %{
  #  name: name,
  #    type: type,
  #    body: body
  #  }
  #end
end
