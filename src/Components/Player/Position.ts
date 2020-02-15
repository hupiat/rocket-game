import { useState } from "react";
import { Direction } from "../../Commons/Direction";
import { ARROW_UP, ARROW_DOWN } from "../../Commons/KeyCodes";

const KEY_PRESS_SHIFT_PX = 20;

interface IPlayerPositionValues {
	position: number;
	setKeysEvents: (isEnabled?: boolean) => void;
}

export const usePlayerPosition = (): IPlayerPositionValues => {
	const [position, setPosition] = useState<number>(0);

	const move = (direction: Direction) => {
		if (direction === Direction.TOP) {
			setPosition(position - KEY_PRESS_SHIFT_PX);
		}
		if (direction === Direction.BOTTOM) {
			setPosition(position + KEY_PRESS_SHIFT_PX);
		}
	};

	const keysListener = (e: KeyboardEvent) => {
		if (e.keyCode === ARROW_UP) {
			move(Direction.TOP);
		}
		if (e.keyCode === ARROW_DOWN) {
			move(Direction.BOTTOM);
		}
	};

	const setKeysEvents = (isEnabled: boolean = true) => {
		if (isEnabled) {
			window.addEventListener("keydown", keysListener);
		} else {
			window.removeEventListener("keydown", keysListener);
		}
	};

	console.log(position);

	return {
		position,
		setKeysEvents
	};
};
