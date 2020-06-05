import { usePlayerContext } from '../Player/Context';
import { IWallValues } from '../Wall/Generation';
import {
	PLAYER_HEIGHT_PX,
	WALL_HEIGHT_PX,
	PLAYER_WIDTH_PX,
} from '../../Commons/DefaultValues';
import { useCallback, useState } from 'react';
import { PLAYER_LEFT_POSITION_PX } from '../Player';

export interface ICollisions {
	lastWallHit: IWallValues[];
	nextWallToPasse: IWallValues[];
	isKnockingWall: (index: number, walls: IWallValues[]) => boolean;
}

export const useCollisions = (): ICollisions => {
	const [lastWallHit, setLastWallHit] = useState<IWallValues[]>([]);
	const [nextWallToPasse, setNextWallToPasse] = useState<IWallValues[]>([]);
	const { playerPosition } = usePlayerContext();

	const isKnockingWallVertically = useCallback(
		(index: number, wall: IWallValues): boolean => {
			const wallHeight = wall.length * WALL_HEIGHT_PX;
			const playerHeight = playerPosition[index] + PLAYER_HEIGHT_PX / 2;

			if (wall.direction === 'top') {
				return wallHeight >= playerHeight;
			}
			if (wall.direction === 'bottom') {
				return window.innerHeight - wallHeight <= playerHeight;
			}

			return false;
		},
		[playerPosition]
	);

	const isKnockingWallHorizontally = useCallback(
		(index: number, wall: IWallValues, walls: IWallValues[]): boolean => {
			if (
				wall.leftPosition > PLAYER_LEFT_POSITION_PX - PLAYER_WIDTH_PX / 2 &&
				wall.leftPosition < PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX / 2
			) {
				setNextWallToPasse((wallPassed) => {
					wallPassed[index] = walls[walls.indexOf(wall) + 1];
					return wallPassed;
				});
				return true;
			}
			return false;
		},
		[]
	);

	const isKnockingWall = useCallback(
		(index: number, walls: IWallValues[]): boolean => {
			// We make a local search on the first walls
			// (the previous, maybe hidden, the actual, and the next one)
			for (let i = walls.length >= 3 ? 3 : walls.length; i > 0; i--) {
				if (
					isKnockingWallHorizontally(i, walls[i - 1], walls) &&
					isKnockingWallVertically(index, walls[i - 1])
				) {
					setLastWallHit((wallsHit) => {
						wallsHit[i] = walls[i];
						return wallsHit;
					});
					return true;
				}
			}

			return false;
		},
		[isKnockingWallHorizontally, isKnockingWallVertically]
	);

	return {
		lastWallHit,
		nextWallToPasse,
		isKnockingWall,
	};
};
