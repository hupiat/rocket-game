import React from 'react';
import { useCallback, useState, useEffect, useContext } from 'react';
import { IWallValues } from '../Components/Wall/Generation';
import { WALL_HEIGHT_PX } from '../Commons/DefaultValues';

export const AI_NEAT_BOT = true;

const PORT = 8888;
const URL = `http://localhost:${PORT}`;

interface Data {
	id: number;
  score: number;
  rocket_top: number;
  wall_direction: number;
	wall_top: number;
	wall_left: number;
}

interface INeatBotContext {
	ask_model: (
		score: number[],
		playerPosition: number[],
		lastWall?: IWallValues
	) => Promise<boolean[]>;
	step_generation: (
		score: number[],
		playerPosition: number[],
		lastWall?: IWallValues
	) => Promise<void>;
	count_generation: number;
}

const SetupNeatBotContext = React.createContext<INeatBotContext | undefined>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const NeatBotContext = ({ children }: IProps) => {
	const [count_generation, setCount_generation] = useState<number>(0);

	const formatData = useCallback(
		(score: number[], playerPosition: number[], lastWall?: IWallValues): string =>
			JSON.stringify(playerPosition.map((_, i) => ({
          id: i,
          score: score[i],
          rocket_top: playerPosition[i],
          wall_direction: lastWall && lastWall.direction === "bottom" ? 1 : 0,
          wall_left: lastWall ? lastWall.leftPosition : 0,
          wall_top: lastWall ? lastWall.length * WALL_HEIGHT_PX : 0,
        }
      ))),
		[]
	);

	const send = useCallback(async (suffix: string) :Promise<any> => {
		try {
      const response = await fetch(`${URL}/${suffix}`);
      return await response.text();
		} catch (e) {
      console.log(e);
			if (AI_NEAT_BOT) {
				throw Error('Server could not be found while AI_NEAT_BOT is set to true');
			}
		}
	}, []);

	const ask_model = useCallback(
		async (
			score: number[],
			playerPosition: number[],
			lastWall?: IWallValues
		): Promise<boolean[]> => {
      const predictions = await send(`ask_model?datas=${formatData(score, playerPosition, lastWall)}`);
      return JSON.parse(predictions.toLowerCase());
    },
		[send, formatData]
	);

	const step_generation = useCallback(
		async (
			score: number[],
			playerPosition: number[],
			lastWall?: IWallValues
		): Promise<void> =>
			await send(`step_generation?datas=${formatData(score, playerPosition, lastWall)}`),
		[send, formatData]
	);

	const fetchCountGeneration = useCallback(async (): Promise<void> => {
    const count = await send('count_generation');
		setCount_generation(Number(count));
	}, [send, setCount_generation]);

	useEffect(() => {
		fetchCountGeneration();
	}, [fetchCountGeneration]);

	return (
		<SetupNeatBotContext.Provider
			value={{
				ask_model,
				step_generation,
				count_generation,
			}}
		>
			{children}
		</SetupNeatBotContext.Provider>
	);
};

export const useNeatBotContext = (): INeatBotContext => {
	const context = useContext(SetupNeatBotContext);
	if (!context) {
		throw Error('Context is not mounted');
	}
	return context;
};

export default NeatBotContext;
