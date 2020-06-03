import { useState, useContext, useRef, MutableRefObject } from 'react';
import React from 'react';
import { PLAYER_LIVES_NUMBER } from '../../Commons/DefaultValues';

interface IPlayerContext {
	playerPosition: number;
	setPlayerPosition: (position: number) => void;
	playerPositionRef: MutableRefObject<number>;
	lives: number;
	setLives: (lives: number) => void;
	livesRef: MutableRefObject<number>;
	losingLifeTimeout: NodeJS.Timeout | undefined;
	setLosingLifeTimeout: (callback: NodeJS.Timeout | undefined) => void;
	isMoving: MutableRefObject<boolean>;
}

const SetupPlayerContext = React.createContext<IPlayerContext | undefined>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const PlayerContext = ({ children }: IProps) => {
	const [playerPosition, setPlayerPositionState] = useState<number>(
		window.innerHeight / 2
	);
	const [lives, setLivesState] = useState<number>(PLAYER_LIVES_NUMBER);
	const [losingLifeTimeout, setLosingLifeTimeout] = useState<
		NodeJS.Timeout | undefined
	>();
	const livesRef = useRef<number>(PLAYER_LIVES_NUMBER);
	const playerPositionRef = useRef<number>(playerPosition);
	const isMoving = useRef<boolean>(false);

	const setLives = (lives: number): void => {
		livesRef.current = lives;
		setLivesState(lives);
	};

	const setPlayerPosition = (position: number): void => {
		playerPositionRef.current = position;
		setPlayerPositionState(position);
	};

	return (
		<SetupPlayerContext.Provider
			value={{
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
