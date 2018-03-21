defmodule Playalgo.GuessYourOpponent do

  alias Playalgo.RandSequence

	def new do
		%{
			player1: %{
				name: "",
				score: 0,
				guess_list: [],
				challenge: 0
			},
			player2: %{
				name: "",
				score: 0,
				guess_list: [],
				challenge: 0
			}
		}
	end

	defp get_guess_list(challenge) do
		rand_seq = Enum.sort(Playalgo.RandSequence.get_rand_seq(20, challenge - 150, challenge + 150, challenge))
		Enum.map rand_seq, fn(x) ->
		  %{number: x, click: false}
		end
	end

	defp skeleton(player, target, opponent_list) do
		%{
			name: player[:name],
			guess_list: opponent_list
		}
	end

	defp init_player(player, player_name, challenge) do
		Map.put(player, :name, player_name)
			|> Map.put(:challenge, elem(Integer.parse(challenge), 0))
			|> Map.put(:guess_list, get_guess_list(elem(Integer.parse(challenge), 0)))
	end

  def client_view(game, player) when player == "player2" do
    %{
      player_state: skeleton(game.player2, game.player1[:challenge], game.player1[:guess_list])
    }
  end

	def client_view(game, player) when player == "player1" do
		%{
			player_state: skeleton(game.player1, game.player2[:challenge], game.player2[:guess_list])
		}
	end

  def has_opponent(game) do
    game.player1.name != "" && game.player2.name != ""
  end

  def get_opponent_name(game, player_name) do 
    if game.player1.name != player_name do
      game.player1.name
    else
      game.player2.name
    end
  end

	def get_player_state(game, player_name) do
                player_state = nil
		if game.player1.name == player_name do
		  player_state = client_view(game, "player1")
		end
		if game.player2.name == player_name do
		  player_state = client_view(game, "player2")
		end
          player_state
	end

	def challenge(game, player_name, challenge) do
		if game.player1.name == "" do
			Map.put(game, :player1, init_player(game.player1, player_name, challenge))
		else
			Map.put(game, :player2, init_player(game.player2, player_name, challenge))
		end
	end
end
