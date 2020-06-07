import {
	useState,
	useContext,
	useRef,
	MutableRefObject,
	useEffect,
	useCallback,
} from 'react';
import React from 'react';
import { PLAYER_LIVES_NUMBER, PLAYER_HEIGHT_PX } from '../../Commons/DefaultValues';
import {
	useNeatBotContext,
	AI_NEAT_BOT,
	AI_NEAT_BOTS_DISPARITY_PX,
} from '../../AI_NEAT_BOT/Context';
import { randomRange } from '../../Commons/Helpers';

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
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
	isPlayingRef: MutableRefObject<boolean>;
}

const SetupPlayerContext = React.createContext<IPlayerContext | undefined>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const PlayerContext = ({ children }: IProps) => {
	const { count_individuals } = useNeatBotContext();

	const init = useCallback(
		(callback: () => any): any[] =>
			[...Array(AI_NEAT_BOT ? count_individuals : 1)].map(() => callback()),
		[count_individuals]
	);
	const initPosition = useCallback(() => {
		let position = window.innerHeight / 2;
		if (AI_NEAT_BOT) {
			const shift = randomRange(10, AI_NEAT_BOTS_DISPARITY_PX);
			if (Math.random() > 0.5) {
				position += shift;
			} else {
				position -= shift;
			}
		}
		return position;
	}, []);

	const [score, setScoreState] = useState<number[]>(init(() => 0));
	const [playerPosition, setPlayerPositionState] = useState<number[]>(
		init(() => initPosition())
	);
	const [lives, setLivesState] = useState<number[]>(init(() => PLAYER_LIVES_NUMBER));
	const [losingLifeTimeout, setLosingLifeTimeoutState] = useState<
		Array<NodeJS.Timeout | undefined>
	>(init(() => undefined));
	const [isPlaying, setIsPlayingState] = useState<boolean>(true);
	const livesRef = useRef<number[]>(init(() => PLAYER_LIVES_NUMBER));
	const playerPositionRef = useRef<number[]>(playerPosition);
	const isMoving = useRef<boolean[]>(init(() => false));
	const isPlayingRef = useRef<boolean>(isPlaying);

	const setIsPlaying = (isPlaying: boolean) => {
		setIsPlayingState(isPlaying);
		isPlayingRef.current = isPlaying;
	};

	useEffect(() => {
		setScoreState(init(() => 0));
		setLivesState(init(() => PLAYER_LIVES_NUMBER));
		setLosingLifeTimeoutState(init(() => undefined));
		livesRef.current = init(() => PLAYER_LIVES_NUMBER);
		playerPositionRef.current = init(() => initPosition());
		setPlayerPositionState(playerPositionRef.current);
		isMoving.current = init(() => false);
	}, [init, initPosition]);

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
		if (AI_NEAT_BOT && livesRef.current.every((l) => l <= 0)) {
			playerPositionRef.current = init(() => initPosition());
			setPlayerPositionState(playerPositionRef.current);
		}
	};

	const setPlayerPosition = (index: number, position: number): void => {
		if (position < window.innerHeight - PLAYER_HEIGHT_PX && position > 0) {
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
				isPlaying,
				setIsPlaying,
				isPlayingRef,
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
