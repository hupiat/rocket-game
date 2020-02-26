import {
	useState,
	useCallback,
	useContext,
	useRef,
	MutableRefObject
} from "react";
import { Direction } from "../../Commons/Direction";
import { ARROW_UP, ARROW_DOWN } from "../../Commons/KeyCodes";
import React from "react";
import {
	PLAYER_LIVES_NUMBER,
	PLAYER_HEIGHT_PX
} from "../../Commons/DefaultValues";

const PLAYER_MOVE_VALUE_PX: number = 20;

interface IPlayerContext {
	playerPosition: number;
	playerKeysListener: (e: React.KeyboardEvent) => void;
	// We need a ref to be listened in the loop callback
	livesRef: MutableRefObject<number>;
	lives: number;
	setLives: (lives: number) => void;
	losingLifeTimeout: NodeJS.Timeout | undefined;
	setLosingLifeTimeout: (callback: NodeJS.Timeout | undefined) => void;
}

const SetupPlayerContext = React.createContext<IPlayerContext | undefined>(
	undefined
);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const PlayerContext = ({ children }: IProps) => {
	const [playerPosition, setPlayerPosition] = useState<number>(0);
	const [lives, setLivesState] = useState<number>(PLAYER_LIVES_NUMBER);
	const [losingLifeTimeout, setLosingLifeTimeout] = useState<
		NodeJS.Timeout | undefined
	>();
	const livesRef = useRef<number>(PLAYER_LIVES_NUMBER);

	const move = useCallback(
		(direction: Direction): void => {
			if (
				direction === Direction.TOP &&
				playerPosition >= PLAYER_MOVE_VALUE_PX
			) {
				setPlayerPosition(playerPosition - PLAYER_MOVE_VALUE_PX);
			}
			if (
				direction === Direction.BOTTOM &&
				playerPosition <= window.innerHeight - PLAYER_HEIGHT_PX
			) {
				setPlayerPosition(playerPosition + PLAYER_MOVE_VALUE_PX);
			}
		},
		[playerPosition, setPlayerPosition]
	);

	const playerKeysListener = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.keyCode === ARROW_UP) {
				move(Direction.TOP);
			}
			if (e.keyCode === ARROW_DOWN) {
				move(Direction.BOTTOM);
			}
		},
		[move]
	);

	const setLives = (lives: number): void => {
		livesRef.current = lives;
		setLivesState(lives);
	};

	return (
		<SetupPlayerContext.Provider
			value={{
				playerPosition,
				playerKeysListener,
				livesRef,
				lives,
				setLives,
				losingLifeTimeout,
				setLosingLifeTimeout
			}}
		>
			{children}
		</SetupPlayerContext.Provider>
	);
};

export const usePlayerContext = (): IPlayerContext => {
	const context = useContext(SetupPlayerContext);
	if (!context) {
		throw Error("Context is not mounted");
	}
	return context;
};

export default PlayerContext;
