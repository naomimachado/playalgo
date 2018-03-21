defmodule Playalgo.GuessYourOpponent do
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

	defp skeleton(player, target) do
		%{
			name: player[:name],
			target: target,
			guess_list: player[:guess_list]
		}
	end

	defp init_player(player, player_name, challenge) do
		Map.put(player, :name, player_name)
			|> Map.put(:challenge, elem(Integer.parse(challenge), 0))
	end

	def client_view(game) do
		%{
			player1_skeleton: skeleton(game.player1, game.player2[:challenge]),
			player2_skeleton: skeleton(game.player2, game.player1[:challenge])
		}
	end

	def challenge(game, player_name, challenge) do
		if game.player1.name == "" do
			Map.put(game, :player1, init_player(game.player1, player_name, challenge))
		else
			Map.put(game, :player2, init_player(game.player2, player_name, challenge))
		end
	end

end
