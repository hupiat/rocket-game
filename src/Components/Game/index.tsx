import React, { useState, CSSProperties, useEffect, useCallback, useRef } from 'react';
import Sound from 'react-sound';
import Player from '../Player';
import Wall from '../Wall';
import HUD from '../HUD';
import Background from './assets/Background.png';
import SoundImage from './assets/Sound.png';
import Music from './assets/Music.mp3';
import { PLAYER_LIVES_NUMBER, PLAYER_IMMUNE_TIME_MS } from '../../Commons/DefaultValues';
import { IWallValues, useWallGeneration } from '../Wall/Generation';
import { usePause } from './Pause';
import { useGameKeysListener } from './KeysListener';
import { useCollisions } from './Collisions';
import { usePlayerContext } from '../Player/Context';

const containerStyle: CSSProperties = {
	display: 'flex',
	height: '100vh',
	width: '100vw',
	backgroundImage: `url(${Background})`,
};

const soundImageStyle: CSSProperties = {
	position: 'absolute',
	width: '300px',
	left: '100px',
	zIndex: 100,
};

// Value in px used to multiply the index when generating
// the walls, representing the space between each one
export const WALLS_SPACE_PX: number = 100;

// Value in ms representing the time between each iteration
export const LOOP_INCREMENT_MS: number = 20;

// Number of active walls at the same time
const WALLS_NUMBER: number = 15;

// Value in px representing the walls shift at each iteration
const SHIFT_INCREMENT_PX: number = 5;

const Game = () => {
	const [walls, setWalls] = useState<IWallValues[]>([]);
	const [score, setScore] = useState<number>(0);
	const shift = useRef<number>(0);
	const { isPaused, setIsPaused, pauseRef } = usePause();
	const {
		lives,
		livesRef,
		losingLifeTimeout,
		setLosingLifeTimeout,
		setLives,
		playerPosition,
		playerPositionRef,
		setPlayerPosition,
		isMoving,
	} = usePlayerContext();
	const isKnockingWall = useCollisions();
	const generateWall = useWallGeneration();
	const handleKeyPress = useGameKeysListener(isPaused, setIsPaused);

	const loop = useCallback(() => {
		if (!pauseRef.current && livesRef.current > 0) {
			// Moving the walls to the left
			setWalls((walls) =>
				walls.map((wall) => {
					wall.leftPosition = wall.leftPosition - SHIFT_INCREMENT_PX;
					return wall;
				})
			);
			!isMoving.current && setPlayerPosition(playerPositionRef.current + 1);
			setTimeout(loop, LOOP_INCREMENT_MS);
		}
	}, [setWalls, setPlayerPosition, pauseRef, livesRef, playerPositionRef, isMoving]);

	const start = useCallback(() => {
		shift.current = 0;
		setIsPaused(false);
		setScore(0);
		setLives(PLAYER_LIVES_NUMBER);
		loop();
	}, [loop, setIsPaused, setLives]);

	useEffect(() => {
		shift.current += SHIFT_INCREMENT_PX;
		if (shift.current % WALLS_SPACE_PX === 0 && walls.length >= WALLS_NUMBER) {
			setScore((score) => score + 1);
		}
	}, [walls]);

	// Handling infinite generation
	useEffect(() => {
		if (shift.current % WALLS_SPACE_PX === 0) {
			setWalls((walls) => {
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
			!isPaused &&
			losingLifeTimeout === undefined &&
			score > 0 &&
			isKnockingWall(walls)
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
			style={containerStyle}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyPress(e, loop)}
		>
			<img src={SoundImage} alt='sound enabling logo' style={soundImageStyle} />

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

			<Sound url={Music} playStatus='PLAYING' />
		</div>
	);
};

export default Game;
