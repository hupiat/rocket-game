import React, { CSSProperties } from "react";
import Sound from "react-sound";
import "./Player.css";
import HitSound from "./HitSound.mp3";
import RocketImage from "./Rocket.gif";
import { usePlayerPositionContext } from "./Position";

const style: CSSProperties = {
	position: "absolute",
	left: "20px",
	width: "100px",
	height: "100px",
	transform: "rotate(90deg)"
};

interface IProps {
	isBlinking: boolean;
}

const Player = ({ isBlinking }: IProps) => {
	const { position } = usePlayerPositionContext();

	return (
		<>
			<img
				src={RocketImage}
				style={{
					...style,
					animation: isBlinking ? "blink 1s linear infinite" : "",
					top: `${position}px`
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
