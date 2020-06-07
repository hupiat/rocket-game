import { useCallback } from 'react';
import { usePlayerContext } from '../Player/Context';
import { ESCAPE, ARROW_SPACE } from '../../Commons/KeyCodes';
import {
	PLAYER_MOVE_VALUE_PX,
	PLAYER_MOVE_REST_DELAY_MS,
} from '../../Commons/DefaultValues';

export interface IKeysListener {
	moveRocket: (index: number) => void;
	handleKeyPress: (
		index: number,
		e: React.KeyboardEvent<HTMLDivElement>,
		loop: () => void
	) => void;
}

export const useGameKeysListener = (
	isPaused: boolean,
	setIsPaused: (isPaused: boolean) => void
): IKeysListener => {
	const { playerPosition, setPlayerPosition, lives, isMoving } = usePlayerContext();

	const moveRocket = useCallback(
		(index: number) => {
			isMoving.current[index] = true;
			setPlayerPosition(index, playerPosition[index] - PLAYER_MOVE_VALUE_PX);
			setTimeout(() => (isMoving.current[index] = false), PLAYER_MOVE_REST_DELAY_MS);
		},
		[isMoving, playerPosition, setPlayerPosition]
	);

	const handleKeyPress = useCallback(
		(index: number, e: React.KeyboardEvent<HTMLDivElement>, loop: () => void) => {
			if (e.keyCode === ESCAPE && lives[index] > 0) {
				const wasPaused = isPaused;
				setIsPaused(!isPaused);
				if (wasPaused) {
					loop();
				}
			} else if (e.keyCode === ARROW_SPACE && !isPaused && lives[index] > 0) {
				moveRocket(index);
			}
		},
		[setIsPaused, isPaused, lives, moveRocket]
	);

	return {
		moveRocket,
		handleKeyPress,
	};
};
