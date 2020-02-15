import React, { Component, useState, CSSProperties, useEffect } from "react";
import Sound from "react-sound";
import Player from "../Player";
import Wall from "../Wall";
import HUD from "../HUD";
import Background from "./Background.png";
import Music from "./Music.mp3";
import { ROCKET_LIVES_NUMBER } from "../../Commons/DefaultValues";
import { IWallValues, generateWall } from "../Wall/Generation";
import { useWallPositions } from "../Wall/Position";
import { usePlayerPosition } from "../Player/Position";
import { ESCAPE } from "../../Commons/KeyCodes";

const style: CSSProperties = {
	height: "100vh",
	width: "100vw",
	backgroundImage: `url(${Background})`
};

// Number of generated walls at the start
const WALLS_NUMBER = 10;

// Value in px used to multiply the index when rendering the walls, representing the space between each one
const WALLS_SPACE_PX = 100;

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
	const { getWallPosition, setWallPosition } = useWallPositions();
	const { setKeysEvents } = usePlayerPosition();

	const timeout = () => {
		setShift(shift => shift + SHIFT_INCREMENT_PX);

		walls.forEach((_, i) =>
			setWallPosition(i, getWallPosition(i) + SHIFT_INCREMENT_PX)
		);

		if (shift % WALLS_SPACE_PX === 0) {
			setScore(score + 1);
		}

		if (lives > 0 && !isPaused) {
			setTimeout(timeout, TIMEOUT_INCREMENT_MS);
		}
	};

	const start = () => {
		setShift(0);

		setWalls(walls => {
			walls = [];
			for (let i = 1; i <= WALLS_NUMBER; i++) {
				walls.push(generateWall());
				setWallPosition(i - 1, i * WALLS_SPACE_PX);
			}
			return walls;
		});

		setKeysEvents();

		timeout();
	};

	useEffect(() => {
		window.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.keyCode === ESCAPE && lives > 0) {
				if (isPaused) {
					setKeysEvents();
					timeout();
				} else {
					setKeysEvents(false);
				}
				setIsPaused(!isPaused);
			}
		});

		start();
	}, []);

	return (
		<div style={style}>
			{walls.map((wall, i) => (
				<Wall
					key={i}
					index={i}
					length={wall.length}
					direction={wall.direction}
				/>
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
