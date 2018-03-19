defmodule PlayalgoWeb.GamesChannel do
  use PlayalgoWeb, :channel

  alias Playalgo.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      Playalgo.GameBackup.load(name)
      game = Playalgo.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{"number" => guess}, socket) do
    game = Game.guess(socket.assigns[:game], guess)
    Playalgo.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end
  
  def handle_in("challenge", %{"player_name" => player_name, "challenge" => challenge}, socket) do
    game = Game.challenge(socket.assigns[:game], player_name, challenge)
    Playalgo.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end
  
  def handle_in("games", %{}, socket) do
    {:reply, {:ok, %{ "games" => Playalgo.GameBackup.games()}}, socket}
  end
  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
