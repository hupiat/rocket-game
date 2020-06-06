import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import HeartImage from './assets/Heart.png';
import { usePlayerContext } from '../Player/Context';
import {
	AI_NEAT_BOT,
	AI_NEAT_BOTS_AUTO_RESTART_MS,
	useNeatBotContext,
} from '../../AI_NEAT_BOT/Context';

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
	const neatBotAutoRestart = useRef<NodeJS.Timeout | undefined>();
	const [maxScore, setMaxScore] = useState<number>(0);
	const { score, lives } = usePlayerContext();
	const { count_generation } = useNeatBotContext();

	const renderScore = (): JSX.Element => (
		<b style={scoreStyle}>
			{AI_NEAT_BOT ? `Gen : ${count_generation}` : score[0]}
			{AI_NEAT_BOT && (
				<>
					<br />
					{`Score: ${score[0]}`}
					<br />
					{`Max: ${maxScore}`}
				</>
			)}
		</b>
	);

	const renderMenu = (isRetry: boolean = false): JSX.Element => {
		let currentMaxScore = 0;
		score.forEach((s) => {
			if (s > maxScore) {
				currentMaxScore = s;
			}
		});
		if (currentMaxScore > maxScore) {
			setMaxScore(currentMaxScore);
		}
		return (
			<div style={menuStyle}>
				<h1>{isRetry ? GAME_OVER_TEXT : PAUSE_TEXT}</h1>

				<h3>
					{SCORE_TEXT} {currentMaxScore}
				</h3>

				<button onClick={() => onRetry && onRetry()}>{RETRY_TEXT}</button>
			</div>
		);
	};

	const renderLives = (): JSX.Element[] =>
		[...Array(lives[0])].map((_, i) => (
			<img src={HeartImage} key={i} alt={`heart-${i}`} style={heartStyle} />
		));

	useEffect(() => {
		if (
			AI_NEAT_BOT &&
			lives.length &&
			lives.every((l) => l <= 0) &&
			!neatBotAutoRestart.current
		) {
			neatBotAutoRestart.current = setTimeout(() => {
				onRetry();
				neatBotAutoRestart.current = undefined;
			}, AI_NEAT_BOTS_AUTO_RESTART_MS);
		}
	}, [lives, onRetry]);

	return (
		<>
			{!AI_NEAT_BOT && renderLives()}
			{!isPaused && renderScore()}
			{isPaused && renderMenu()}
			{lives.every((l) => l <= 0) && renderMenu(true)}
		</>
	);
};

export default HUD;
