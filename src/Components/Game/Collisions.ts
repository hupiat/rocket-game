import { usePlayerContext } from '../Player/Context';
import { IWallValues } from '../Wall/Generation';
import {
	PLAYER_HEIGHT_PX,
	WALL_HEIGHT_PX,
	PLAYER_WIDTH_PX,
} from '../../Commons/DefaultValues';
import { useCallback } from 'react';
import { PLAYER_LEFT_POSITION_PX } from '../Player';

export const useCollisions = (): ((index: number, walls: IWallValues[]) => boolean) => {
	const { playerPosition } = usePlayerContext();

	const isKnockingWallVertically = useCallback(
		(index: number, wall: IWallValues): boolean => {
			const wallPxHeight: number = wall.length * WALL_HEIGHT_PX;
			const playerPxHeight: number = playerPosition[index] + PLAYER_HEIGHT_PX / 2;

			if (wall.direction === 'top') {
				return wallPxHeight >= playerPxHeight;
			}
			if (wall.direction === 'bottom') {
				return window.innerHeight - wallPxHeight <= playerPxHeight;
			}

			return false;
		},
		[playerPosition]
	);

	const isKnockingWallHorizontally = useCallback(
		(wall: IWallValues): boolean =>
			wall.leftPosition > PLAYER_LEFT_POSITION_PX - PLAYER_WIDTH_PX / 2 &&
			wall.leftPosition < PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX / 2,
		[]
	);

	const isKnockingWall = useCallback(
		(index: number, walls: IWallValues[]): boolean => {
			// We make a local search on the first walls
			// (the previous, maybe hidden, the actual, and the next one)
			for (let i = 0; i < 3; i++) {
				if (
					isKnockingWallHorizontally(walls[i]) &&
					isKnockingWallVertically(index, walls[i])
				) {
					return true;
				}
			}

			return false;
		},
		[isKnockingWallHorizontally, isKnockingWallVertically]
	);

	return isKnockingWall;
};
