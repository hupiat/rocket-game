import React, { CSSProperties } from "react";
import HeartImage from "./Heart.png";

const heartStyle: CSSProperties = {
	position: "relative",
	zIndex: 10,
	width: "50px",
	height: "50px"
};

const scoreStyle: CSSProperties = {
	position: "absolute",
	zIndex: 10,
	color: "white",
	left: "95vw",
	top: "1vh",
	fontSize: "150%"
};

const menuStyle: CSSProperties = {
	position: "absolute",
	zIndex: 10,
	color: "white",
	top: "30vh",
	left: "43vw",
	textAlign: "center"
};

const GAME_OVER_TEXT = "GAME OVER";

const SCORE_TEXT = "Your score : ";

const RETRY_TEXT = "Try again";

const PAUSE_TEXT = "PAUSE";

interface IProps {
	lives: number;
	score: number;
	isMenuEnabled: boolean;
	isRetryMenuEnabled: boolean;
	onRetry: () => void;
}

const HUD = ({
	lives,
	score,
	isMenuEnabled,
	isRetryMenuEnabled,
	onRetry
}: IProps) => {
	const renderScore = () => <b style={scoreStyle}>{score}</b>;

	const renderMenu = (isRetry: boolean = false) => (
		<div style={menuStyle}>
			<h1>{isRetry ? GAME_OVER_TEXT : PAUSE_TEXT}</h1>

			<h3>
				{SCORE_TEXT} {score}
			</h3>

			<button onClick={() => onRetry && onRetry()}>{RETRY_TEXT}</button>
		</div>
	);

	const renderLives = () => {
		const livesImages: JSX.Element[] = [];

		for (let i = 0; i < lives; i++) {
			livesImages.push(
				<img src={HeartImage} key={i} alt={`heart-${i}`} style={heartStyle} />
			);
		}

		return livesImages;
	};

	return (
		<>
			{!isRetryMenuEnabled && renderLives()}
			{!isRetryMenuEnabled && !isMenuEnabled && renderScore()}
			{isMenuEnabled && !isRetryMenuEnabled && renderMenu()}
			{isRetryMenuEnabled && renderMenu(true)}
		</>
	);
};

export default HUD;
