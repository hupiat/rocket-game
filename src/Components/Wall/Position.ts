import { useState } from "react";

interface IWallPositionValues {
	getWallPosition: (i: number) => number;
	setWallPosition: (i: number, position: number) => void;
}

export const useWallPositions = (): IWallPositionValues => {
	const [wallPositions, setWallPositions] = useState<number[]>([]);

	const getWallPosition = (i: number) => wallPositions[i];

	const setWallPosition = (i: number, position: number) =>
		setWallPositions((wallPositions: number[]) => {
			wallPositions[i] = position;
			return wallPositions;
		});

	return {
		getWallPosition,
		setWallPosition
	};
};
