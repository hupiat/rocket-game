import { WALL_BLOCKS_MAX_LENGTH } from '../../Commons/DefaultValues';
import { WALLS_SPACE_PX } from '../Game';
import { Direction } from '../../Commons/Direction';
import * as uuid from 'uuid';
import { useCallback } from 'react';
import { IWall } from '.';

// Handle consistency for many walls generated next to each other
// Increasing this value will make the game easier to play
const GENERATION_TOLERANCE: number = 3;

let previousLength: number;
let previousDirection: Direction;

const generateLength = (direction: Direction, length: number): number => {
	if (GENERATION_TOLERANCE > 0) {
		if (previousDirection !== direction) {
			while (Math.abs(previousLength - length) < GENERATION_TOLERANCE && length > 1) {
				length--;
			}
		}
		previousLength = length;
		previousDirection = direction;
	}
	return length;
};

export const useWallGeneration = (): ((index: number) => IWall) => {
	return useCallback((index: number) => {
		const randomIdx = Math.floor(Math.random() * Math.floor(2));
		const direction = randomIdx % 2 === 0 ? 'top' : 'bottom';

		let length = Math.floor(Math.random() * (WALL_BLOCKS_MAX_LENGTH - 1) + 1);
		length = generateLength(direction, length);

		const leftPosition = index * WALLS_SPACE_PX;

		return {
			id: uuid.v4(),
			length,
			direction,
			leftPosition,
		};
	}, []);
};
