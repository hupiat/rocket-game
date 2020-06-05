import React, { CSSProperties, useRef, useEffect } from 'react';
import Sound from 'react-sound';
import './Player.css';
import HitSound from './assets/HitSound.mp3';
import RocketImage from './assets/Rocket.gif';
import { usePlayerContext } from './Context';
import { PLAYER_WIDTH_PX, PLAYER_HEIGHT_PX } from '../../Commons/DefaultValues';

export const PLAYER_LEFT_POSITION_PX = 20;

const style: CSSProperties = {
	position: 'absolute',
	left: `${PLAYER_LEFT_POSITION_PX}px`,
	width: `${PLAYER_WIDTH_PX}px`,
	height: `${PLAYER_HEIGHT_PX}px`,
	transform: 'rotate(90deg)',
};

interface IProps {
	index: number;
  isBlinking: boolean;
}

const Player = ({ index, isBlinking }: IProps) => {
	// We need to store this in a ref to avoid loop sound playing since
	// the component is re-rendered each time the player is moving
	const shouldPlaySound = useRef<boolean>(true);

	const { playerPosition, lives } = usePlayerContext();

	useEffect(() => {
		if (!isBlinking) {
			shouldPlaySound.current = true;
		}
	}, [isBlinking]);

	return (
		<>
			<img
				src={RocketImage}
				style={{
					...style,
					animation: isBlinking || lives[index] <= 0 ? 'blink 1s linear infinite' : '',
					top: `${playerPosition}px`,
				}}
				alt='rocket'
			/>

			<Sound
				url={HitSound}
				playStatus={isBlinking && shouldPlaySound.current ? 'PLAYING' : 'STOPPED'}
				onFinishedPlaying={() => (shouldPlaySound.current = false)}
			/>
		</>
	);
};

export default Player;
