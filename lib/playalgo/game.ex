defmodule Playalgo.Game do
  alias Playalgo.GuessYourOpponent

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

  defp joinable_games(game, game_channel) when game_channel == "guess_your_opponent" do
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
      has_opponent: has_opponent(game, game_channel, game_name),
      player_state: get_player_game_state(game, game_channel, game_name, player_name)
    }
  end

  def client_view(game, game_channel, player_name) do
    games = joinable_games(game, game_channel)
    {game_name, player_state} = get_player_state(game, games, game_channel, player_name)
    %{
      games: games,
      player_state: player_state,
      has_opponent: has_opponent(game, game_channel, game_name)
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
end
