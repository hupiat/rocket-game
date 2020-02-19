import React, {
	useState,
	CSSProperties,
	useEffect,
	useCallback,
	useRef
} from "react";
import Sound from "react-sound";
import Player from "../Player";
import Wall from "../Wall";
import HUD from "../HUD";
import Background from "./assets/Background.png";
import Music from "./assets/Music.mp3";
import {
	PLAYER_LIVES_NUMBER,
	WALL_WIDTH_PX,
	PLAYER_IMMUNE_TIME_MS
} from "../../Commons/DefaultValues";
import { IWallValues, generateWall } from "../Wall/Generation";
import { usePause } from "./Pause";
import { useGameKeysListener } from "./KeysListener";
import { useCollisions } from "./Collisions";
import { usePlayerContext } from "../Player/Context";

const style: CSSProperties = {
	height: "100vh",
	width: "100vw",
	backgroundImage: `url(${Background})`
};

// Value in px used to multiply the index when generating
// the walls, representing the space between each one
export const WALLS_SPACE_PX = 100;

// Number of generated walls at the beginning
const WALLS_NUMBER = 20;

// Value in px representing the walls shift at each iteration
const SHIFT_INCREMENT_PX = 5;

// Value in ms representing the time between each iteration
const LOOP_INCREMENT_MS = 20;

const Game = () => {
	const [walls, setWalls] = useState<IWallValues[]>([]);
	const [score, setScore] = useState<number>(0);
	const shift = useRef<number>(0);
	const { isPaused, setIsPaused, pauseRef } = usePause();
	const { isKnockingWall } = useCollisions();
	const { handleKeyPress } = useGameKeysListener(isPaused, setIsPaused);
	const {
		lives,
		livesRef,
		isLosingLives,
		setLives,
		setIsLosingLives
	} = usePlayerContext();

	const loop = useCallback((): void => {
		if (!pauseRef.current && livesRef.current > 0) {
			// Moving the walls to the left
			setWalls(walls =>
				walls.map(wall => {
					wall.leftPosition = wall.leftPosition - SHIFT_INCREMENT_PX;
					return wall;
				})
			);
			setTimeout(loop, LOOP_INCREMENT_MS);
		}
	}, [setWalls, pauseRef, livesRef]);

	const start = useCallback((): void => {
		shift.current = 0;
		setIsPaused(false);
		setScore(0);
		setLives(PLAYER_LIVES_NUMBER);
		// Setting up start walls
		setWalls(walls => {
			walls = [];
			for (let i = 1; i <= WALLS_NUMBER; i++) {
				walls.push(generateWall(i));
			}
			return walls;
		});
		loop();
	}, [setWalls, loop, setIsPaused, setLives]);

	useEffect(() => {
		// Incrementing the total shift from the beginning,
		// used only to increment the score
		shift.current += SHIFT_INCREMENT_PX;
		if (shift.current % WALLS_SPACE_PX === 0 && lives > 0) {
			setScore(score + 1);
		}

		// Handling infinite generation
		const maxWallsOnScreen = Math.round(
			window.screen.width / (WALLS_SPACE_PX + WALL_WIDTH_PX)
		);
		if (
			shift.current % WALLS_SPACE_PX === 0 &&
			score > WALLS_NUMBER - maxWallsOnScreen &&
			lives > 0
		) {
			setWalls(walls => {
				if (walls.length > WALLS_NUMBER) {
					walls.shift();
				}
				walls.push(generateWall(WALLS_NUMBER));
				return walls;
			});
		}
	}, [walls, score, setLives, lives]);

	// Checking collisions
	useEffect(() => {
		if (walls.some(isKnockingWall) && !isLosingLives && !isPaused) {
			setLives(lives - 1);
			setIsLosingLives(true);
		}
	}, [
		walls,
		isKnockingWall,
		isLosingLives,
		isPaused,
		lives,
		setLives,
		setIsLosingLives
	]);

	useEffect(() => {
		setTimeout(() => setIsLosingLives(false), PLAYER_IMMUNE_TIME_MS);
	}, [lives, setIsLosingLives]);

	useEffect(start, []);

	return (
		<div
			tabIndex={1}
			style={style}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				handleKeyPress(e, loop)
			}
		>
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