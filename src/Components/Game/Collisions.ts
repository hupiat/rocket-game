import { usePlayerContext } from '../Player/Context';
import { IWall } from '../Wall';
import {
	PLAYER_HEIGHT_PX,
	WALL_HEIGHT_PX,
	PLAYER_WIDTH_PX,
	MONSTER_WIDTH_PX,
	MONSTER_HEIGHT_PX,
} from '../../Commons/DefaultValues';
import { useCallback, useState } from 'react';
import { PLAYER_LEFT_POSITION_PX } from '../Player';
import { IMonster } from '../Monster';

export interface ICollisions {
	isPlayerKnockingWall: (index: number, walls: IWall[]) => boolean;
	isMonsterKnockingWall: (monster: IMonster, walls: IWall[]) => boolean;
	lastWallHit: IWall[];
	nextWallToPass: IWall[];
}

export const useCollisions = (): ICollisions => {
	const [lastWallHit, setLastWallHit] = useState<IWall[]>([]);
	const [nextWallToPass, setNextWallToPass] = useState<IWall[]>([]);
	const { playerPosition } = usePlayerContext();

	const isKnockingWallVertically = useCallback(
		(entityHeight: number, wall: IWall): boolean => {
			const wallHeight = wall.length * WALL_HEIGHT_PX;
			if (wall.direction === 'top') {
				return wallHeight >= entityHeight;
			}
			if (wall.direction === 'bottom') {
				return window.innerHeight - wallHeight <= entityHeight;
			}
			return false;
		},
		[]
	);

	const isKnockingWallHorizontally = useCallback(
		(leftSide: number, rightSide: number, wall: IWall): boolean =>
			wall.leftPosition > leftSide && wall.leftPosition < rightSide,
		[]
	);

	const localCollisionSearch = useCallback(
		(
			check: (i: number) => boolean,
			walls: IWall[],
			callback?: (i: number) => void
		): boolean => {
			for (let i = walls.length >= 5 ? 5 : walls.length; i > 0; i--) {
				if (check(i)) {
					callback && callback(i);
					return true;
				}
			}
			return false;
		},
		[]
	);

	const isPlayerKnockingWall = useCallback(
		(index: number, walls: IWall[]): boolean => {
			return localCollisionSearch(
				(i) => {
					const matchHorizontal = isKnockingWallHorizontally(
						(PLAYER_LEFT_POSITION_PX - PLAYER_WIDTH_PX) / 2,
						(PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX) / 2,
						walls[i - 1]
					);
					matchHorizontal &&
						setNextWallToPass((wallsToPass) => {
							wallsToPass[index] = walls[i - 1];
							return wallsToPass;
						});
					return (
						matchHorizontal &&
						isKnockingWallVertically(
							playerPosition[index] + PLAYER_HEIGHT_PX / 2,
							walls[i - 1]
						)
					);
				},
				walls,
				(i) =>
					setLastWallHit((wallsHit) => {
						wallsHit[i] = walls[i];
						return wallsHit;
					})
			);
		},
		[
			isKnockingWallHorizontally,
			isKnockingWallVertically,
			localCollisionSearch,
			playerPosition,
		]
	);

	const isMonsterKnockingWall = useCallback(
		(monster: IMonster, walls: IWall[]): boolean => {
			return localCollisionSearch(
				(i) =>
					isKnockingWallHorizontally(
						(monster.left - MONSTER_WIDTH_PX) / 2,
						(monster.left + MONSTER_WIDTH_PX) / 2,
						walls[i - 1]
					) && isKnockingWallVertically(monster.top + MONSTER_HEIGHT_PX, walls[i - 1]),
				walls
			);
		},
		[isKnockingWallHorizontally, isKnockingWallVertically, localCollisionSearch]
	);

	return {
		isPlayerKnockingWall,
		isMonsterKnockingWall,
		lastWallHit,
		nextWallToPass,
	};
};
