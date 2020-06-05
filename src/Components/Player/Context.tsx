import { useState, useContext, useRef, MutableRefObject } from 'react';
import React from 'react';
import { PLAYER_LIVES_NUMBER } from '../../Commons/DefaultValues';
import { useNeatBotContext, AI_NEAT_BOT } from '../../AI_NEAT_BOT/Context';

interface IPlayerContext {
	score: number[];
	setScore: (index: number, score: number) => void;
	playerPosition: number[];
	setPlayerPosition: (index: number, position: number) => void;
	playerPositionRef: MutableRefObject<number[]>;
	lives: number[];
	setLives: (index: number, lives: number) => void;
	livesRef: MutableRefObject<number[]>;
	losingLifeTimeout: Array<NodeJS.Timeout | undefined>;
	setLosingLifeTimeout: (index: number, callback: NodeJS.Timeout | undefined) => void;
	isMoving: MutableRefObject<boolean[]>;
}

const SetupPlayerContext = React.createContext<IPlayerContext | undefined>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const PlayerContext = ({ children }: IProps) => {
	const { count_generation } = useNeatBotContext();
	function init<T>(value: T): T[] {
		return [...Array(AI_NEAT_BOT ? count_generation : 1)].map(() => value);
	}
	const [score, setScoreState] = useState<number[]>(init(0));
	const [playerPosition, setPlayerPositionState] = useState<number[]>(
		init(window.innerHeight / 2)
	);
	const [lives, setLivesState] = useState<number[]>(init(PLAYER_LIVES_NUMBER));
	const [losingLifeTimeout, setLosingLifeTimeoutState] = useState<
		Array<NodeJS.Timeout | undefined>
	>(init(undefined));
	const livesRef = useRef<number[]>(init(PLAYER_LIVES_NUMBER));
	const playerPositionRef = useRef<number[]>(playerPosition);
	const isMoving = useRef<boolean[]>(init(false));

	const setScore = (index: number, score: number) =>
		setScoreState((scoreState) => {
			scoreState[index] = score;
			return scoreState;
		});

	const setLives = (index: number, lives: number): void => {
		livesRef.current[index] = lives;
		setLivesState((livesState) => {
			livesState[index] = lives;
			return livesState;
		});
	};

	const setPlayerPosition = (index: number, position: number): void => {
		if (position < 1080) {
			playerPositionRef.current[index] = position;
			setPlayerPositionState((positionState) => {
				positionState[index] = position;
				return positionState;
			});
		}
	};

	const setLosingLifeTimeout = (
		index: number,
		losingLifeTimeout?: NodeJS.Timeout
	): void =>
		setLosingLifeTimeoutState((losingLifeTimeoutState) => {
			losingLifeTimeoutState[index] = losingLifeTimeout;
			return losingLifeTimeoutState;
		});

	return (
		<SetupPlayerContext.Provider
			value={{
				score,
				setScore,
				playerPositionRef,
				playerPosition,
				setPlayerPosition,
				livesRef,
				lives,
				setLives,
				losingLifeTimeout,
				setLosingLifeTimeout,
				isMoving,
			}}
		>
			{children}
		</SetupPlayerContext.Provider>
	);
};

export const usePlayerContext = (): IPlayerContext => {
	const context = useContext(SetupPlayerContext);
	if (!context) {
		throw Error('Context is not mounted');
	}
	return context;
};

export default PlayerContext;
