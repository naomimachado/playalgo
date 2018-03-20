defmodule Playalgo.Game do
  alias Playalgo.GuessOpponentGame

  def new do
    %{
      guess_your_opponent: %{
      }, sort_attack: %{
      }, organize_my_cheatsheet: %{
      }
    }
  end

  defp joinable_games(game, game_channel) do
    Enum.filter Map.to_list(game.guess_your_opponent), fn(game) ->
      elem(game, 1).player1.name == "" || elem(game, 1).player2.name == ""
    end
  end

  def client_view(game, game_channel) when game_channel == "guess_your_opponent" do
    joinable_games(game, game_channel)
  end

  def join(game, game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
    if Map.has_key?(game.guess_your_opponent, game_name) do
      Map.put(game.guess_your_opponent, game_name,
        Playalgo.GuessOpponentGame.challenge(game.guess_your_opponent[game_name], player_name, challenge))
    else
      Map.put_new(game.guess_your_opponent, game_name, Playalgo.GuessOpponentGame.challenge(Playalgo.GuessOpponentGame.new(), player_name, challenge))
  end
end
