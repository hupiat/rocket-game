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
import { AI_NEAT_BOT, useNeatBotContext } from '../../AI_NEAT_BOT/Context';

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
	const shift = useRef<number>(0);
	const { isPaused, setIsPaused, pauseRef } = usePause();
	const {
		score,
		setScore,
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
	const {
		ask_model,
		step_generation,
		count_generation,
		setCount_generation,
	} = useNeatBotContext();
	const { moveRocket, handleKeyPress } = useGameKeysListener(isPaused, setIsPaused);
	const { isKnockingWall, lastWallHit, nextWallToPasse } = useCollisions();
	const generateWall = useWallGeneration();

	const loop = useCallback(() => {
		// Moving the walls to the left
		setWalls((walls) =>
			walls.map((wall) => {
				wall.leftPosition = wall.leftPosition - SHIFT_INCREMENT_PX;
				return wall;
			})
		);
		if (
			!pauseRef.current &&
			(livesRef.current.some((l) => l > 0) || livesRef.current.length === 0)
		) {
			playerPositionRef.current.forEach((pos, i) => {
				if (!isMoving.current[i]) {
					setPlayerPosition(i, pos + 1.3);
				}
			});
			setTimeout(loop, LOOP_INCREMENT_MS);
		}
	}, [setWalls, setPlayerPosition, pauseRef, livesRef, playerPositionRef, isMoving]);

	const start = useCallback(() => {
		if (shift.current !== 0) {
			AI_NEAT_BOT && step_generation(score, playerPosition, lastWallHit);
		}
		shift.current = 0;
		setIsPaused(false);
		score.forEach((_, i) => setScore(i, 0));
		playerPosition.forEach((_, i) => setLives(i, PLAYER_LIVES_NUMBER));
		loop();
	}, [
		loop,
		score,
		setScore,
		setIsPaused,
		setLives,
		playerPosition,
		step_generation,
		lastWallHit,
	]);

	useEffect(() => {
		shift.current += SHIFT_INCREMENT_PX;
		if (shift.current % WALLS_SPACE_PX === 0 && walls.length >= WALLS_NUMBER) {
			score.forEach((_, i) => setScore(i, score[i] + 1));
		}
	}, [walls, score, setScore]);

	// Handling bots
	useEffect(() => {
		if (AI_NEAT_BOT) {
			ask_model(score, playerPosition, nextWallToPasse).then((predictions) => {
				predictions.forEach((prediction, i) => {
					if (prediction) {
						moveRocket(i);
					}
				});
			});
		}
	}, [ask_model, score, playerPosition, walls, moveRocket, nextWallToPasse]);

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
		playerPosition.forEach((_, i) => {
			if (!isPaused && losingLifeTimeout[i] === undefined && isKnockingWall(i, walls)) {
				setLives(i, lives[i] - 1);
				setLosingLifeTimeout(
					i,
					setTimeout(() => setLosingLifeTimeout(i, undefined), PLAYER_IMMUNE_TIME_MS)
				);
			}
		});
		// We just want to check collisions when elements are moving
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [walls, playerPosition]);

	useEffect(start, []);

	return (
		<div
			tabIndex={1}
			style={containerStyle}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				!AI_NEAT_BOT && handleKeyPress(0, e, loop)
			}
		>
			<img src={SoundImage} alt='sound enabling logo' style={soundImageStyle} />

			{walls.map((wall, i) => (
				<Wall key={i} {...wall} />
			))}

			{playerPosition.map((_, i) => (
				<Player isBlinking={!!losingLifeTimeout[i]} index={i} key={i} />
			))}

			<HUD
				onRetry={() => {
					AI_NEAT_BOT && setCount_generation(count_generation + 1);
					start();
				}}
				isPaused={isPaused}
			/>

			<Sound url={Music} playStatus='PLAYING' />
		</div>
	);
};

export default Game;
