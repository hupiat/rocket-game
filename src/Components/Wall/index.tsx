import React, { CSSProperties } from "react";
import { Direction } from "../../Commons/Direction";
import WallImage from "./Wall.png";

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
			width: `50px`,
			height: `50px`,
			left: `${leftPosition}px`
		};

		const shift = i * 50;

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
