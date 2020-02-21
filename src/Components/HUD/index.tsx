import React, { CSSProperties } from "react";
import HeartImage from "./assets/Heart.png";

const heartStyle: CSSProperties = {
	position: "relative",
	zIndex: 1,
	width: "50px",
	height: "50px",
	alignSelf: "flex-end"
};

const scoreStyle: CSSProperties = {
	position: "absolute",
	zIndex: 10,
	color: "white",
	fontSize: "150%",
	left: "10px"
};

const menuStyle: CSSProperties = {
	position: "absolute",
	zIndex: 10,
	color: "white",
	top: "30vh",
	left: "43vw",
	textAlign: "center"
};

const SCORE_TEXT: string = "Your score : ";

const RETRY_TEXT: string = "Try again";

const PAUSE_TEXT: string = "PAUSE";

const GAME_OVER_TEXT: string = "GAME OVER";

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
	const renderScore = (): JSX.Element => <b style={scoreStyle}>{score}</b>;

	const renderMenu = (isRetry: boolean = false): JSX.Element => (
		<div style={menuStyle}>
			<h1>{isRetry ? GAME_OVER_TEXT : PAUSE_TEXT}</h1>

			<h3>
				{SCORE_TEXT} {score}
			</h3>

			<button onClick={() => onRetry && onRetry()}>{RETRY_TEXT}</button>
		</div>
	);

	const renderLives = (): JSX.Element[] => {
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
