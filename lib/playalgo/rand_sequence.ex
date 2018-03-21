defmodule Playalgo.RandSequence do

	defp create_rand_seq(seq, rem, start, end) when rem == 0 do
		seq
	end

  defp create_rand_seq(seq, rem, start, end) do
	  num = Enum.random(start..end)
		create_rand_seq(seq ++ [num], rem - 1, start, end)
	end

  def get_rand_seq(numbers, start, end, target) do
		create_rand_seq([target], rem - 1, start, end)
	end
	
end
