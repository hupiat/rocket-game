import { useCallback } from "react";
import { usePlayerContext } from "../Player/Context";
import { ESCAPE } from "../../Commons/KeyCodes";

interface IGameKeysListenerValues {
	handleKeyPress: (
		e: React.KeyboardEvent<HTMLDivElement>,
		loop: () => void
	) => void;
}

export const useGameKeysListener = (
	isPaused: boolean,
	lives: number,
	setIsPaused: (isPaused: boolean) => void
): IGameKeysListenerValues => {
	const { playerKeysListener } = usePlayerContext();

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>, loop: () => void): void => {
			if (e.keyCode === ESCAPE && lives > 0) {
				setIsPaused(!isPaused);
			}
			if (!isPaused) {
				playerKeysListener(e);
				loop();
			}
		},
		[setIsPaused, isPaused, lives, playerKeysListener]
	);

	return {
		handleKeyPress
	};
};
