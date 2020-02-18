import React, { CSSProperties } from "react";
import Sound from "react-sound";
import "./Player.css";
import HitSound from "./assets/HitSound.mp3";
import RocketImage from "./assets/Rocket.gif";
import { usePlayerContext } from "./Context";
import {
	PLAYER_WIDTH_PX,
	PLAYER_HEIGHT_PX,
	PLAYER_LEFT_POSITION_PX
} from "../../Commons/DefaultValues";

const style: CSSProperties = {
	position: "absolute",
	left: `${PLAYER_LEFT_POSITION_PX}px`,
	width: `${PLAYER_WIDTH_PX}px`,
	height: `${PLAYER_HEIGHT_PX}px`,
	transform: "rotate(90deg)"
};

interface IProps {
	isBlinking: boolean;
}

const Player = ({ isBlinking }: IProps) => {
	const { playerPosition } = usePlayerContext();

	return (
		<>
			<img
				src={RocketImage}
				style={{
					...style,
					animation: isBlinking ? "blink 1s linear infinite" : "",
					top: `${playerPosition}px`
				}}
				alt="rocket"
			/>

			<Sound
				url={HitSound}
				playStatus={isBlinking ? "PLAYING" : "STOPPED"}
				loop={false}
			/>
		</>
	);
};

export default Player;
