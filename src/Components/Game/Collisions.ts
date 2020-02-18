import { usePlayerContext } from "../Player/Context";
import { IWallValues } from "../Wall/Generation";
import { Direction } from "../../Commons/Direction";
import {
	PLAYER_HEIGHT_PX,
	WALL_HEIGHT_PX,
	PLAYER_LEFT_POSITION_PX,
	PLAYER_WIDTH_PX
} from "../../Commons/DefaultValues";

interface ICollisionsValues {
	isKnockingWall: (wall: IWallValues) => boolean;
}

export const useCollisions = (): ICollisionsValues => {
	const { playerPosition } = usePlayerContext();

	const isKnockingWallVertically = (wall: IWallValues): boolean => {
		const wallPxHeight = wall.length * WALL_HEIGHT_PX;
		const playerPxHeight = playerPosition + PLAYER_HEIGHT_PX / 2;

		if (wall.direction === Direction.TOP) {
			return wallPxHeight >= playerPxHeight;
		}
		if (wall.direction === Direction.BOTTOM) {
			return window.innerHeight - wallPxHeight <= playerPxHeight;
		}

		return false;
	};

	const isKnockingWallHorizontally = (wall: IWallValues): boolean =>
		wall.leftPosition > PLAYER_LEFT_POSITION_PX - PLAYER_WIDTH_PX / 2 &&
		wall.leftPosition < PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX / 2;

	const isKnockingWall = (wall: IWallValues): boolean =>
		isKnockingWallHorizontally(wall) && isKnockingWallVertically(wall);

	return {
		isKnockingWall
	};
};
