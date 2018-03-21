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

  defp get_player_state_helper_guess_your_opponent(games, rem, player_name, player_state) when rem = 0 do
    nil
  end

  defp get_player_state_helper_guess_your_opponent(games, rem, player_name, player_state) when player_state != nil do
    player_state
  end

  defp get_player_state_helper_guess_your_opponent(games, rem, player_name, player_state) do
    cur_g = game.guess_your_opponent[(hd games)]
    get_player_state_helper_guess_your_opponent((tl games),
      rem - 1,
      Playalgo.GuessYourOpponent.get_player_state(cur_g, player_name))
  end

  defp get_player_state(games, game_channel, player_name) when game_channel = "guess_your_opponent" do
    get_player_state_helper_guess_your_opponent(games, length(games), player_name, nil)
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

  def client_view(game, game_channel, player_name) do
    games = joinable_games(game, game_channel)
    %{
      games: games,
      current_player: get_player_state(games, name, player_name)
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
