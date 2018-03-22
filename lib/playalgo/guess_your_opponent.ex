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

  defp get_clicks(guesses) do
    Enum.reduce guesses, 0, fn(x, acc) ->
      if x.click == true do
        acc + 1
      else
        acc
      end
    end
  end

  defp get_updated_score(guesses, res) when res == "match" do
    clicks = get_clicks(guesses)
    div(100, clicks)
  end

  defp get_updated_score(guesses, res) when res == "high" do
    clicks = get_clicks(guesses)
    div(70, clicks)
  end

  defp get_updated_score(guesses, res) when res == "low" do
    clicks = get_clicks(guesses)
    div(70, clicks)
  end

  defp get_update_score(guesses, res) when res == "very_high" do
    clicks = get_clicks(guesses)
    div(40, clicks)
  end

  defp get_updated_score(guesses, res) when res == "very_low" do
    clicks = get_clicks(guesses)
    div(40, clicks)
  end
  
  defp get_updated_score(guesses, res) do
    clicks = get_clicks(guesses)
    div(50, clicks)
  end

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
    score = get_updated_score(new_guess_list, res)
    if game.player1.name != player_name do
      player1 = Map.put(game.player1, :guess_list, new_guess_list)
      player2 = Map.put(game.player2, :score, game.player2[:score] + score)
      {res, Map.put(game, :player1, player1)
      |> Map.put(:player2, player2)}
    else
      player2 = Map.put(game.player2, :guess_list, new_guess_list)
      player1 = Map.put(game.player1, :score, game.player1[:score] + score)
      {res, Map.put(game, :player2, player2)
      |> Map.put(:player1, player1)}
    end
  end

	defp get_guess_list(challenge) do
		rand_seq = Enum.sort(Playalgo.RandSequence.get_rand_seq(40, Enum.random(0..challenge),
		  Enum.random((challenge + 1)..(challenge + 235)), challenge))
		Enum.map rand_seq, fn(x) ->
		  %{number: x, click: false}
		end
	end

	defp skeleton(player, target, opponent_list, id, opponent_score) do
		%{
			name: player[:name],
      score: player[:score],
			guess_list: opponent_list,
                        id: id,
                        opponent_score: opponent_score
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

  defp get_guesses(game, player_name) do
    if game.player1.name != player_name do
      game.player1.guess_list
    else
      game.player2.guess_list
    end
  end

  def client_view(game, player) when player == "player2" do
    %{
      player_state: skeleton(game.player2, game.player1[:challenge], game.player1[:guess_list], 2, game.player1[:score])
    }
  end

	def client_view(game, player) when player == "player1" do
		%{
			player_state: skeleton(game.player1, game.player2[:challenge], game.player2[:guess_list], 1, game.player2[:score])
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

  def guess(game, player_name, guess) do
    update_game(game, player_name, guess)
  end
end
