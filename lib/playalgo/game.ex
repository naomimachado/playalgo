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

  defp joinable_games(game, game_channel) when game_channel == "guess_your_opponent" do
    IO.inspect game
    Map.keys(game.guess_your_opponent)
  end

  defp new_game(game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
     new_g = %{}
     Map.put_new(new_g, game_name, Playalgo.GuessYourOpponent.challenge(Playalgo.GuessYourOpponent.new(), player_name, challenge))
  end

  def client_view(game) do
    joinable_games(game, "guess_your_opponent")
  end

  def join(game, game_channel, game_name, player_name, challenge) when game_channel == "guess_your_opponent" do
    if Map.has_key?(game.guess_your_opponent, game_name) do
      Map.put(game[:guess_your_opponent], game_name,
        Playalgo.GuessYourOpponent.challenge(game.guess_your_opponent[game_name], player_name, challenge))
    else
      new_g = new_game(game_channel, game_name, player_name, challenge)
      Map.put(game, :guess_your_opponent, new_g)
    end
  end
end
