defmodule Playalgo.Leaderboard do

alias Playalgo.GuessYourOpponent do
	defp new_players() do
		Map.new([{:player_name, ""}, {:played, 0}, {:wins, 0}, {:score, 0}, {:points, 0}])
	end

	defp get_points(no_of_games, no_of_wins, score) do
		(no_of_wins * score)/no_of_games
	end

	defp add_player(leaderboard, player_name) do
		leaderboard
		|> Map.put(player_name, new_player())
	end

	defp is_winner?(game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
		Map.has_key?(game.guess_your_opponent[game_name], :winner) &&
			player_name == game.guess_your_opponent[game_name][:winner]
	end

	defp player_score(game, game_channel, game_name, player_name) do
		Playalgo.GuessYourOpponent.get_player_score(game.guess_your_opponent[game], player_name)
	end

	defp update_player(leaderboard, game, game_channel, game_name, player_name) when game_channel == "guess_your_opponent" do
		player_state = leaderboard[player_name]
		player_state = Map.put(player_state, :played, player_state[:played] + 1)
		if is_winner?(game, game_channel, game_name, player_name) do
			player_state = Map.put(player_state, :wins, player_state[:wins] + 1)
		end
		game_score = player_score(game, game_channel, game_name, player_name)
		player_state = Map.put(player_state, :score, player_state[:score] + game_score)
		total_points = get_points(player_state[:played], player_state[:wins], player_state[:score])
		player_state = Map.put(player_state, :points, total_points)
		leaderboard
		|> Map.put(:player_name, player_state)
	end

	def create_leaderboard(game, game_names, game_channel,
		leaderboard, remaining_players) when game_channel == "guess_your_opponent"  and remaining_players == 0 do
		leaderboard
	end

	def create_leaderboard(game, game_names, game_channel,
		leaderboard, remaining_games) when game_channel == "guess_your_opponent" do
		game_name = (hd game_names)
		player1_state = game.guess_your_opponent[game_name].player1
		player2_state = game.guess_your_opponent[game_name].player2
		if !Map.has_key(leaderboard, player1_state.name) do
			leaderboard = add_player(leaderboard, player1_state.name)
		end
		if !Map.has_key(leaderboard, player2_state.name) do
			leaderboard = add_player(leaderboard, player2_state.name)
		end
		leaderboard = update_player(leaderboard, game, game_channel, game_name, player1_state.name)
		leaderboard = update_player(leaderboard, game, game_channel, game_name, player2_state.name)
		create_leaderboard(game, (tl game_names), game_channel, leaderboard, remaining_games - 1)
	end

	def game_leaderboard(game, game_channel, game_names) when game_channel == "guess_your_opponent" do
		create_leaderboard(game, game_names, game_channel, %{}, length(game_names))
	end
end
