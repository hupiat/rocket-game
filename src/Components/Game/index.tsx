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

// Number of active walls at the same time
const WALLS_NUMBER = 15;

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
		losingLifeTimeout,
		setLosingLifeTimeout,
		setLives,
		playerPosition
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
		shift.current += SHIFT_INCREMENT_PX;
		if (shift.current % WALLS_SPACE_PX === 0) {
			setScore(score + 1);
		}
		// It would be a circular dependency with score
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walls]);

	// Handling infinite generation
	useEffect(() => {
		if (shift.current % WALLS_SPACE_PX === 0 && score > WALLS_NUMBER - 1) {
			setWalls(walls => {
				if (walls.length > WALLS_NUMBER + 1) {
					walls.shift();
				}
				walls.push(generateWall(WALLS_NUMBER));
				return walls;
			});
		}
		// We don't want this function be triggered unless the walls
		// are moving, otherwise it would generate too many ones
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walls]);

	// Checking collisions
	useEffect(() => {
		if (
			walls.some(isKnockingWall) &&
			!isPaused &&
			losingLifeTimeout === undefined
		) {
			setLives(lives - 1);
			setLosingLifeTimeout(
				setTimeout(() => setLosingLifeTimeout(undefined), PLAYER_IMMUNE_TIME_MS)
			);
		}
		// We just want to check collisions when elements are moving
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walls, playerPosition]);

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

			<Player isBlinking={!!losingLifeTimeout} />

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
