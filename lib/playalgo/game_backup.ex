
defmodule Playalgo.GameBackup do
  use Agent

  def start_link do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def save(name, game) do
    Agent.update __MODULE__, fn state ->
      Map.put(state, name, game)
    end
  end

  def load(name) do
    Agent.get __MODULE__, fn state ->
      Map.get(state, name)
    end
  end

  def games() do
    Agent.get __MODULE__, fn state ->
      Enum.filter Map.to_list(state), fn(item) ->
        elem(item, 1)[:player1].name == "" || elem(item, 1)[:player2].name == ""
      end
    end
  end
end
