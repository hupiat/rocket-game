import React, { CSSProperties } from 'react';
import HeartImage from './assets/Heart.png';
import { usePlayerContext } from '../Player/Context';
import { AI_NEAT_BOT } from '../../AI_NEAT_BOT/Context';

const heartStyle: CSSProperties = {
	position: 'relative',
	zIndex: 1,
	width: '50px',
	height: '50px',
	alignSelf: 'flex-end',
};

const scoreStyle: CSSProperties = {
	position: 'absolute',
	zIndex: 10,
	color: 'white',
	fontSize: '150%',
	left: '10px',
};

const menuStyle: CSSProperties = {
	position: 'absolute',
	zIndex: 10,
	color: 'white',
	top: '30vh',
	left: '43vw',
	textAlign: 'center',
};

const SCORE_TEXT: string = 'Your score : ';

const RETRY_TEXT: string = 'Try again';

const PAUSE_TEXT: string = 'PAUSE';

const GAME_OVER_TEXT: string = 'GAME OVER';

interface IProps {
	onRetry: () => void;
	isPaused: boolean;
}

const HUD = ({ onRetry, isPaused }: IProps) => {
	const { score, lives } = usePlayerContext();

	const renderScore = (): JSX.Element => <b style={scoreStyle}>{score[0]}</b>;

	const renderMenu = (isRetry: boolean = false): JSX.Element => {
		let maxScore = 0;
		score.forEach((s) => {
			if (s > maxScore) {
				maxScore = s;
			}
		});
		return (
			<div style={menuStyle}>
				<h1>{isRetry ? GAME_OVER_TEXT : PAUSE_TEXT}</h1>

				<h3>
					{SCORE_TEXT} {maxScore}
				</h3>

				<button onClick={() => onRetry && onRetry()}>{RETRY_TEXT}</button>
			</div>
		);
	};

	const renderLives = (): JSX.Element[] =>
		[...Array(lives[0])].map((_, i) => (
			<img src={HeartImage} key={i} alt={`heart-${i}`} style={heartStyle} />
		));

	return (
		<>
			{!AI_NEAT_BOT && renderLives()}
			{!isPaused && renderScore()}
			{isPaused && renderMenu()}
			{AI_NEAT_BOT
				? lives.every((l) => l <= 0) && renderMenu(true)
				: lives[0] <= 0 && renderMenu(true)}
		</>
	);
};

export default HUD;
