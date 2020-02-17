import React, { useState, CSSProperties, useEffect, useCallback } from "react";
import Sound from "react-sound";
import Player from "../Player";
import Wall from "../Wall";
import HUD from "../HUD";
import Background from "./Background.png";
import Music from "./Music.mp3";
import { ROCKET_LIVES_NUMBER } from "../../Commons/DefaultValues";
import { IWallValues, generateWall } from "../Wall/Generation";
import { ESCAPE } from "../../Commons/KeyCodes";
import { usePlayerPositionContext } from "../Player/Position";

const style: CSSProperties = {
	height: "100vh",
	width: "100vw",
	backgroundImage: `url(${Background})`
};

// Value in px used to multiply the index when generating the walls, representing the space between each one
export const WALLS_SPACE_PX = 100;

// Number of generated walls at the start
const WALLS_NUMBER = 100;

// Value in px representing the walls shift at each iteration
const SHIFT_INCREMENT_PX = 5;

// Value in ms representing the time between each iteration
const TIMEOUT_INCREMENT_MS = 20;

const Game = () => {
	const [shift, setShift] = useState<number>(0);
	const [walls, setWalls] = useState<IWallValues[]>([]);
	const [lives, setLives] = useState<number>(ROCKET_LIVES_NUMBER);
	const [score, setScore] = useState<number>(0);
	const [isLosingLives, setIsLosingLives] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const { keysListener } = usePlayerPositionContext();

	const timeout = useCallback(() => {
		if (isPaused) {
			return;
		}

		setShift(1000);

		setWalls(walls =>
			walls.map(wall => {
				wall.leftPosition = wall.leftPosition - SHIFT_INCREMENT_PX;
				return wall;
			})
		);

		console.log(shift);
		if (shift % WALLS_SPACE_PX === 0) {
			setScore(score + 1);
		}

		if (lives > 0 && !isPaused) {
			setTimeout(timeout, TIMEOUT_INCREMENT_MS);
		}
	}, [isPaused, lives, score, shift, setShift]);

	const start = useCallback(() => {
		setShift(0);

		setWalls(walls => {
			walls = [];
			for (let i = 1; i <= WALLS_NUMBER; i++) {
				walls.push(generateWall(i));
			}
			return walls;
		});

		timeout();
	}, [setShift, setWalls, timeout]);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.keyCode === ESCAPE && lives > 0) {
				setIsPaused(isPaused => !isPaused);
			}
			if (!isPaused) {
				keysListener(e);
			}
		},
		[isPaused, lives, keysListener]
	);

	useEffect(start, []);

	return (
		<div tabIndex={1} style={style} onKeyDown={handleKeyPress}>
			{walls.map((wall, i) => (
				<Wall key={i} {...wall} />
			))}

			<Player isBlinking={isLosingLives} />

			<HUD
				lives={lives}
				score={score}
				isMenuEnabled={isPaused}
				isRetryMenuEnabled={lives <= 0}
				onRetry={start}
			/>

			<Sound url={Music} playStatus="PLAYING" />
		</div>
	);
};

export default Game;
