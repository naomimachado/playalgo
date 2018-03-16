defmodule Playalgo.Game do
  def new do
    %{
      guesses: %{
        player: "test",
        list: []
      }
    }
  end
  
  def client_view(game) do
    %{
       guesses: game.guesses
    }
  end

  def guess(game, id, active) do
    guesses = %{
      player: "test",
      list: []
    }
    Map.put(game, :guesses, guesses)
  end
end

