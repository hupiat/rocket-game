import { useState, useCallback, useContext } from "react";
import { Direction } from "../../Commons/Direction";
import { ARROW_UP, ARROW_DOWN } from "../../Commons/KeyCodes";
import React from "react";

const KEY_PRESS_VALUE_PX = 20;

interface IPlayerPositionContext {
	position: number;
	keysListener: (e: React.KeyboardEvent) => void;
}

const SetupPlayerPositionContext = React.createContext<
	IPlayerPositionContext | undefined
>(undefined);

interface IProps {
	children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const PlayerPositionContext = ({ children }: IProps) => {
	const [position, setPosition] = useState<number>(0);

	const move = useCallback(
		(direction: Direction) => {
			if (direction === Direction.TOP && position >= KEY_PRESS_VALUE_PX) {
				setPosition(position - KEY_PRESS_VALUE_PX);
			}
			if (
				direction === Direction.BOTTOM &&
				// Window height - rocket height (px)
				position <= window.innerHeight - 100
			) {
				setPosition(position + KEY_PRESS_VALUE_PX);
			}
		},
		[position, setPosition]
	);

	const keysListener = useCallback(
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

	return (
		<SetupPlayerPositionContext.Provider
			value={{
				position,
				keysListener
			}}
		>
			{children}
		</SetupPlayerPositionContext.Provider>
	);
};

export const usePlayerPositionContext = (): IPlayerPositionContext => {
	const context = useContext(SetupPlayerPositionContext);
	if (!context) {
		throw Error("Context is not mounted");
	}
	return context;
};

export default PlayerPositionContext;
