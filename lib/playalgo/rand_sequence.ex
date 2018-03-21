defmodule Playalgo.RandSequence do

	defp create_rand_seq(seq, rem, start, last) when rem == 0 do
		seq
	end

  defp create_rand_seq(seq, rem, start, last) do
	  num = Enum.random(start..last)
		create_rand_seq(seq ++ [num], rem - 1, start, last)
	end

  def get_rand_seq(numbers, start, last, target) do
		create_rand_seq([target], numbers - 1, start, last)
	end
	
end
