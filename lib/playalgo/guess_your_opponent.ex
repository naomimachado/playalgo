defmodule Playalgo.GuessYourOpponent do

  alias Playalgo.RandSequence

	def new do
		%{
			player1: %{
				name: "",
				score: 0,
				guess_list: [],
				challenge: 0,
        clicks: 0,
        guessed: []
			},
			player2: %{
				name: "",
				score: 0,
				guess_list: [],
				challenge: 0,
        clicks: 0,
        guessed: []
			}
		}
	end

  defp get_updated_score(res, clicks) when res == "match" do
    div(200, clicks)
  end

  defp get_updated_score(res, clicks) when res == "high" do
    div(100, clicks)
  end

  defp get_updated_score(res, clicks) when res == "low" do
    div(100, clicks)
  end

  defp get_update_score(res, clicks) when res == "very_high" do
    div(40, clicks)
  end

  defp get_updated_score(res, clicks) when res == "very_low" do
    div(40, clicks)
  end

  defp get_updated_score(res, clicks) do
    div(50, clicks)
  end

  defp is_already_guessed?(guessed, guess) {
    Enum.find(guessed, fn(x) -> guessed.number == guess end)
  }

  defp guess_result(guess, target) do
    if guess == target do
      "match"
    else
      if guess > target do
        if (guess - target) >= 100 do
          "very_high"
        else
          "high"
        end
      else
        if (target - guess) >= 100 do
          "very_low"
        else
          "low"
        end
      end
    end
  end

  defp get_updated_guess_list(game, player_name, guess) do
    current_list = get_guesses(game, player_name)
    Enum.map current_list, fn(number) ->
      if number.number == guess do
        Map.put(number, :click, true)
      else
        number
      end
    end
  end

  defp update_game(game, player_name, guess) do
    target = get_target(game, player_name)
    res =  guess_result(guess, target)
    new_guess_list = get_updated_guess_list(game, player_name, guess)
    clicks = get_clicks(game, player_name) + 1
    score = get_updated_score(res, clicks)
    if game.player1.name != player_name do
      player1 = Map.put(game.player1, :guess_list, new_guess_list)
      player2 = Map.put(game.player2, :score, game.player2[:score] + score)
      player2 = Map.put(player2, :clicks, get_clicks(game, player_name) + 1)
      if !is_already_guessed?(game.player2.guessed, guess) do
        player2 = Map.put(player2, :guessed, game.player2.guessed ++ [%{number: guess, result: res}])
      end
      {res, Map.put(game, :player1, player1)
      |> Map.put(:player2, player2)}
    else
      player2 = Map.put(game.player2, :guess_list, new_guess_list)
      player1 = Map.put(game.player1, :score, game.player1[:score] + score)
      player1 = Map.put(player1, :clicks, get_clicks(game, player_name) + 1)
      if !is_already_guessed?(game.player1.guessed, guess) do
        player1 = Map.put(player1, :guessed, game.player1.guessed ++ [%{number: guess, result: res}])
      end
      {res, Map.put(game, :player2, player2)
      |> Map.put(:player1, player1)}
    end
  end

	defp get_guess_list(challenge) do
		rand_seq = Enum.sort(Playalgo.RandSequence.get_rand_seq(90, Enum.random(0..challenge),
		  Enum.random((challenge + 1)..(challenge + 635)), challenge))
		Enum.map rand_seq, fn(x) ->
		  %{number: x, click: false}
		end
	end

	defp skeleton(player, target, opponent_list, id, opponent_score, opponent_name) do
		%{
			name: player[:name],
      score: player[:score],
			guess_list: opponent_list,
      clicks: player[:clicks],
      guessed: player[:guessed],
      id: id,
      opponent_score: opponent_score,
      opponent_name: opponent_name
		}
	end

	defp init_player(player, player_name, challenge) do
		Map.put(player, :name, player_name)
			|> Map.put(:challenge, elem(Integer.parse(challenge), 0))
			|> Map.put(:guess_list, get_guess_list(elem(Integer.parse(challenge), 0)))
	end

  defp get_target(game, player_name) do
    if game.player1.name != player_name do
      game.player1.challenge
    else
      game.player2.challenge
    end
  end

  defp get_clicks(game, player_name) do
    if game.player1.name == player_name do
      game.player1.clicks
    else
      game.player2.clicks
    end
  end

  defp get_guesses(game, player_name) do
    if game.player1.name != player_name do
      game.player1.guess_list
    else
      game.player2.guess_list
    end
  end

  def client_view(game, player) when player == "player2" do
    %{
      player_state: skeleton(game.player2, game.player1[:challenge], game.player1[:guess_list], 2, game.player1[:score], game.player1[:name])
    }
  end

	def client_view(game, player) when player == "player1" do
		%{
			player_state: skeleton(game.player1, game.player2[:challenge], game.player2[:guess_list], 1, game.player2[:score], game.player2[:name])
		}
	end

  def has_opponent(game) do
    game.player1.name != "" && game.player2.name != ""
  end

  def has_player(game, player_name) do
    game.player1.name == player_name || game.player2.name == player_name
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

  def guess(game, player_name, guess) do
    update_game(game, player_name, guess)
  end

  def get_viewer_state(game, player_name) do
    %{
      player1_state: client_view(game, "player1"),
      player2_state: client_view(game, "player2")
    }
  end
end
