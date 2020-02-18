import { useCallback } from "react";
import { usePlayerContext } from "../Player/Context";
import { ESCAPE, ARROW_DOWN, ARROW_UP } from "../../Commons/KeyCodes";

interface IGameKeysListenerValues {
	handleKeyPress: (
		e: React.KeyboardEvent<HTMLDivElement>,
		loop: () => void
	) => void;
}

export const useGameKeysListener = (
	isPaused: boolean,
	setIsPaused: (isPaused: boolean) => void
): IGameKeysListenerValues => {
	const { playerKeysListener, lives } = usePlayerContext();

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>, loop: () => void): void => {
			if (e.keyCode === ESCAPE && lives > 0) {
				const wasPaused = isPaused;
				setIsPaused(!isPaused);
				if (wasPaused) {
					loop();
				}
			}
			if (
				(e.keyCode === ARROW_DOWN || e.keyCode === ARROW_UP) &&
				!isPaused &&
				lives > 0
			) {
				playerKeysListener(e);
			}
		},
		[setIsPaused, isPaused, lives, playerKeysListener]
	);

	return {
		handleKeyPress
	};
};
