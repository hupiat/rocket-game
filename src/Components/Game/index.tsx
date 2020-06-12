import React, {
	useState,
	CSSProperties,
	useEffect,
	useCallback,
	useRef,
	useMemo,
} from 'react';
import Sound from 'react-sound';
import Player from '../Player';
import Wall, { IWall } from '../Wall';
import HUD from '../HUD';
import Background from './assets/Background.png';
import SoundImage from './assets/Sound.png';
import Music from './assets/Music.mp3';
import {
	PLAYER_LIVES_NUMBER,
	PLAYER_IMMUNE_TIME_MS,
	WALL_WIDTH_PX,
} from '../../Commons/DefaultValues';
import { useWallGeneration } from '../Wall/Generation';
import { usePause } from './Pause';
import { useGameKeysListener } from './KeysListener';
import { useCollisions } from './Collisions';
import { usePlayerContext } from '../Player/Context';
import { AI_NEAT_BOT, useNeatBotContext } from '../../AI_NEAT_BOT/Context';
import { useMonster } from '../Monster/useMonster';
import Monster, { IMonster } from '../Monster';

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

export const WALLS_SPACE_PX = 150;

export const LOOP_INCREMENT_MS = 25;

export const SHIFT_INCREMENT_PX = 5;

const WALLS_NUMBER = 10;
const GRAVITY_FORCE = 1.3;

const Game = () => {
	const [walls, setWalls] = useState<IWall[]>([]);
	const wallsRef = useRef(walls);
	const [monsters, setMonsters] = useState<IMonster[]>([]);
	const shift = useRef<number>(0);
	const timeout = useRef<NodeJS.Timeout>();
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
	const { isPaused, setIsPaused } = usePause();
	const {
		ask_model,
		step_generation,
		count_generation,
		setCount_generation,
	} = useNeatBotContext();
	const { moveRocket, handleKeyPress } = useGameKeysListener();
	const { isPlayerKnockingWall, lastWallHit, nextWallToPass } = useCollisions();
	const { hitMonster, nextMonster, killerMonster } = useMonster(
		monsters,
		setMonsters,
		walls
	);
	const generateWall = useWallGeneration();

	const isAlive = useMemo(() => !lives.every((l) => l <= 0), [lives]);
	const isPlaying = useMemo(() => timeout.current && !isPaused && isAlive, [
		isPaused,
		isAlive,
	]);

	// Handle walls movement, collisions, gravity
	const loop = useCallback(() => {
		timeout.current && clearTimeout(timeout.current);
		setWalls((walls) => {
			const newWalls = walls.map((wall) => {
				wall.leftPosition -= SHIFT_INCREMENT_PX;
				return wall;
			});
			wallsRef.current = newWalls;
			return newWalls;
		});
		setMonsters((monsters) =>
			monsters.map((monster) => {
				monster.left -= SHIFT_INCREMENT_PX;
				monster.top += GRAVITY_FORCE;
				return monster;
			})
		);
		playerPositionRef.current.forEach((pos, i) => {
			if (!isMoving.current[i]) {
				setPlayerPosition(i, pos + GRAVITY_FORCE);
			}
		});
		timeout.current = setTimeout(loop, LOOP_INCREMENT_MS);
	}, [isMoving, playerPositionRef, setPlayerPosition, setWalls]);

	const handleCollisions = useCallback(() => {
		if (isAlive) {
			playerPosition.forEach((_, i) => {
				if (
					losingLifeTimeout[i] === undefined &&
					(hitMonster(i) || isPlayerKnockingWall(i, wallsRef.current))
				) {
					setLives(i, livesRef.current[i] - 1);
					livesRef.current[i] > 0 &&
						setLosingLifeTimeout(
							i,
							setTimeout(() => {
								setLosingLifeTimeout(i, undefined);
							}, PLAYER_IMMUNE_TIME_MS)
						);
				}
			});
		} else if (timeout.current) {
			clearTimeout(timeout.current);
		}
	}, [
		hitMonster,
		isPlayerKnockingWall,
		livesRef,
		timeout,
		losingLifeTimeout,
		playerPosition,
		setLives,
		setLosingLifeTimeout,
		isAlive,
	]);

	const handleScore = useCallback(() => {
		shift.current += SHIFT_INCREMENT_PX;
		if (shift.current % WALLS_SPACE_PX === 0 && walls.length >= WALLS_NUMBER) {
			score.forEach((_, i) => setScore(i, score[i] + 1));
		}
	}, [walls, score, setScore]);

	const handleWallsGeneration = useCallback(() => {
		if (shift.current % WALLS_SPACE_PX === 0) {
			setWalls((walls) => {
				if (walls[0] && walls[0].leftPosition < -WALL_WIDTH_PX) {
					walls.shift();
				}
				walls.push(generateWall(WALLS_NUMBER));
				return walls;
			});
		}
	}, [setWalls, generateWall]);

	const handleBotsMovements = useCallback(() => {
		ask_model(score, playerPosition, nextWallToPass, nextMonster()).then(
			(predictions) => {
				predictions.forEach((prediction, i) => {
					if (prediction) {
						moveRocket(i);
					}
				});
			}
		);
	}, [ask_model, score, playerPosition, moveRocket, nextWallToPass, nextMonster]);

	// Initialize states and loop
	const start = useCallback(() => {
		const startLoop = () => {
			setWalls([]);
			shift.current = 0;
			setIsPaused(false);
			setMonsters([]);
			score.forEach((_, i) => setScore(i, 0));
			playerPosition.forEach((_, i) => setLives(i, PLAYER_LIVES_NUMBER));
			loop();
		};
		if (AI_NEAT_BOT && shift.current !== 0) {
			step_generation(score, playerPosition, lastWallHit, killerMonster).then(startLoop);
		} else {
			startLoop();
		}
	}, [
		score,
		setScore,
		setIsPaused,
		setLives,
		playerPosition,
		step_generation,
		lastWallHit,
		loop,
		killerMonster,
	]);

	useEffect(() => {
		if (isPlaying) {
			handleCollisions();
			if (AI_NEAT_BOT && nextWallToPass) {
				handleBotsMovements();
			}
		}
	}, [
		walls,
		monsters,
		playerPosition,
		handleCollisions,
		handleScore,
		handleBotsMovements,
		nextWallToPass,
		isPlaying,
	]);

	useEffect(() => {
		if (isPlaying) {
			handleScore();
			handleWallsGeneration();
		}
	}, [walls, isPlaying, handleScore, handleWallsGeneration]);

	useEffect(start, []);

	return (
		<div
			tabIndex={1}
			style={containerStyle}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyPress(0, e, loop)}
		>
			<img src={SoundImage} alt='sound enabling logo' style={soundImageStyle} />

			{walls.map((w) => (
				<Wall key={w.id} {...w} />
			))}

			{playerPosition.map((_, i) => (
				<Player isBlinking={!!losingLifeTimeout[i]} index={i} key={i} />
			))}

			{monsters.map((m) => (
				<Monster key={m.id} monster={m} />
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
