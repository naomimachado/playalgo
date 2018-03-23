defmodule Playalgo.RandSequence do

	defp is_exist?(seq, num) do
		Enum.find(seq, fn(x) -> x == num end)
	end

	defp create_rand_seq(seq, rem, start, last) when rem == 0 do
		seq
	end

  defp create_rand_seq(seq, rem, start, last) do
	  num = Enum.random(start..last)
		if is_exist?(seq, num) do
			create_rand_seq(seq, rem, start, last)
		else
			create_rand_seq(seq ++ [num], rem - 1, start, last)
		end
	end

  def get_rand_seq(numbers, start, last, target) do
		create_rand_seq([target], numbers - 1, start, last)
	end
end
