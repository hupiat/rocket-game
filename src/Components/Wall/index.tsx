import React, { CSSProperties } from "react";
import { Direction } from "../../Commons/Direction";
import WallImage from "./Wall.png";
import { useWallPositions } from "./Position";

interface IProps {
	index: number;
	length: number;
	direction: Direction;
}

const Wall = ({ index, length, direction }: IProps) => {
	const { getWallPosition } = useWallPositions();
	const blocks: JSX.Element[] = [];

	for (let i = 0; i < length; i++) {
		const style: CSSProperties = {
			position: "absolute",
			width: `50px`,
			height: `50px`,
			left: `${getWallPosition(index)}vw`
		};

		if (direction === Direction.TOP) {
			style.top = `${i}vh`;
		}
		if (direction === Direction.BOTTOM) {
			style.top = `calc(100vh - ${i}vh)`;
		}

		blocks.push(<img src={WallImage} alt={"Wall"} style={style} />);
	}

	return <>{blocks}</>;
};

export default Wall;
