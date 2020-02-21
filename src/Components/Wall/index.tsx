import React, { CSSProperties } from "react";
import { Direction } from "../../Commons/Direction";
import WallImage from "./assets/Wall.png";
import { WALL_WIDTH_PX, WALL_HEIGHT_PX } from "../../Commons/DefaultValues";

interface IProps {
	length: number;
	leftPosition: number;
	direction: Direction;
}

const Wall = ({ length, leftPosition, direction }: IProps) => {
	const blocks: JSX.Element[] = [];

	for (let i = 0; i < length; i++) {
		const style: CSSProperties = {
			position: "absolute",
			width: `${WALL_WIDTH_PX}px`,
			height: `${WALL_HEIGHT_PX}px`,
			left: `${leftPosition}px`
		};

		const shift = i * WALL_HEIGHT_PX;

		if (direction === Direction.TOP) {
			style.top = `${shift}px`;
		}
		if (direction === Direction.BOTTOM) {
			style.top = `calc(95vh - ${shift}px)`;
		}

		blocks.push(<img src={WallImage} alt={"Wall"} style={style} key={i} />);
	}

	return <>{blocks}</>;
};

export default Wall;
