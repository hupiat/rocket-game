import React, { Dispatch } from 'react';
import { useCallback, useState, useEffect, useContext } from 'react';
import { IWall } from '../Components/Wall';
import { WALL_HEIGHT_PX } from '../Commons/DefaultValues';
import { IMonster } from '../Components/Monster';

export const AI_NEAT_BOT = false;
export const AI_NEAT_BOTS_DISPARITY_PX = 300;
export const AI_NEAT_BOTS_AUTO_RESTART_MS = 1000;

const PORT = 8080;
const URL = `http://localhost:${PORT}`;

interface Data {
	id: number;
	score: number;
	rocket_top: number;
	wall_direction: number;
	wall_left: number;
	wall_length: number;
	monster_top: number;
	monster_left: number;
}

interface INeatBotContext {
	ask_model: (
		score: number[],
		playerPosition: number[],
		walls: IWall[],
		monster?: IMonster
	) => Promise<boolean[]>;
	step_generation: (
		score: number[],
		playerPosition: number[],
		walls: IWall[],
		monster?: IMonster
	) => Promise<void>;
	count_individuals: number;
	count_generation: number;
	setCount_generation: Dispatch<number>;
}

const SetupNeatBotContext = React.createContext<INeatBotContext | undefined>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const NeatBotContext = ({ children }: IProps) => {
	const [count_individuals, setCount_individuals] = useState<number>(0);
	const [count_generation, setCount_generation] = useState<number>(0);

	const formatData = useCallback(
		(
			score: number[],
			playerPosition: number[],
			monster?: IMonster,
			walls?: IWall[]
		): string =>
			JSON.stringify(
				playerPosition.map(
					(_, i): Data => ({
						id: i,
						score: score[i],
						rocket_top: playerPosition[i],
						wall_direction: walls && walls[i] && walls[i].direction === 'bottom' ? 1 : 0,
						wall_left: walls && walls[i] ? walls[i].leftPosition : 0,
						wall_length: walls && walls[i] ? walls[i].length * WALL_HEIGHT_PX : 0,
						monster_left: monster ? monster.left : 0,
						monster_top: monster ? monster.top : 0,
					})
				)
			),
		[]
	);

	const send = useCallback(async (url: string, params?: object): Promise<
		string | undefined
	> => {
		try {
			let formatedParams = `${url}${params ? '?' : ''}`;
			if (params) {
				const paramsLength = Object.keys(params).length;
				Object.keys(params).forEach(
					(param, i) =>
						(formatedParams += `${param}=${params[param]}${
							i !== paramsLength - 1 ? '&' : ''
						}`)
				);
			}
			const response = await fetch(`${URL}/${formatedParams}`);
			return await response.text();
		} catch (e) {
			console.log(e);
		}
	}, []);

	const ask_model = useCallback(
		async (
			score: number[],
			playerPosition: number[],
			walls: IWall[],
			monster?: IMonster
		): Promise<boolean[]> => {
			const datas = formatData(score, playerPosition, monster, walls);
			const predictions =
				datas !== '[]' &&
				(await send('ask_model', {
					datas,
					max_height: window.innerHeight,
					max_width: window.innerWidth,
				}));
			return predictions ? JSON.parse(predictions.toLowerCase()) : [];
		},
		[send, formatData]
	);

	const step_generation = useCallback(
		async (
			score: number[],
			playerPosition: number[],
			walls: IWall[],
			monster?: IMonster
		): Promise<void> => {
			setCount_generation(count_generation + 1);
			const datas = formatData(score, playerPosition, monster, walls);
			datas !== '[]' && (await send('step_generation', { datas }));
		},
		[send, formatData, count_generation, setCount_generation]
	);

	const fetchCountIndividuals = useCallback(async (): Promise<void> => {
		const count = await send('count_individuals');
		setCount_individuals(Number(count));
	}, [send, setCount_individuals]);

	useEffect(() => {
		fetchCountIndividuals();
	}, [fetchCountIndividuals]);

	return (
		<SetupNeatBotContext.Provider
			value={{
				ask_model,
				step_generation,
				count_individuals,
				count_generation,
				setCount_generation,
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
