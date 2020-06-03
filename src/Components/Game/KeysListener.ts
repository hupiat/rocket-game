import { useCallback } from 'react';
import { usePlayerContext } from '../Player/Context';
import { ESCAPE, ARROW_SPACE } from '../../Commons/KeyCodes';
import {
	PLAYER_MOVE_VALUE_PX,
	PLAYER_MOVE_REST_DELAY_MS,
} from '../../Commons/DefaultValues';

export const useGameKeysListener = (
	isPaused: boolean,
	setIsPaused: (isPaused: boolean) => void
): ((e: React.KeyboardEvent<HTMLDivElement>, loop: () => void) => void) => {
	const { playerPosition, setPlayerPosition, lives, isMoving } = usePlayerContext();

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>, loop: () => void) => {
			if (e.keyCode === ESCAPE && lives > 0) {
				const wasPaused: boolean = isPaused;
				setIsPaused(!isPaused);
				if (wasPaused) {
					loop();
				}
			} else if (e.keyCode === ARROW_SPACE && !isPaused && lives > 0) {
				isMoving.current = true;
				setPlayerPosition(playerPosition - PLAYER_MOVE_VALUE_PX);
				setTimeout(() => (isMoving.current = false), PLAYER_MOVE_REST_DELAY_MS);
			}
		},
		[setIsPaused, isPaused, lives, playerPosition, setPlayerPosition, isMoving]
	);

	return handleKeyPress;
};
