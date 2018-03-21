defmodule PlayalgoWeb.GamesChannel do
  use PlayalgoWeb, :channel

  alias Playalgo.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Playalgo.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game, name, payload["player"]), "player" => payload["player"]}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("join_game", %{"game_channel" => game_channel, "game_name" => game_name,
    "player_name" => player_name, "challenge" => challenge}, socket) do
    game = Game.join(socket.assigns[:game], game_channel, game_name, player_name, challenge)
    Playalgo.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    broadcast socket, "join_game", %{ "game" => Game.client_view(game, game_channel, game_name, player_name)}
    {:reply, {:ok, %{ "game" => Game.client_view(game, game_channel, game_name, player_name)}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
