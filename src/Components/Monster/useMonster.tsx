import {
	useEffect,
	Dispatch,
	useCallback,
	SetStateAction,
	useRef,
	useState,
} from 'react';
import { IMonster } from '.';
import { usePlayerContext } from '../Player/Context';
import { IWall } from '../Wall';
import {
	PLAYER_WIDTH_PX,
	MONSTER_HEIGHT_PX,
	MONSTER_WIDTH_PX,
	PLAYER_MOVE_VALUE_PX,
	PLAYER_HEIGHT_PX,
} from '../../Commons/DefaultValues';
import { useCollisions } from '../Game/Collisions';
import { PLAYER_LEFT_POSITION_PX } from '../Player';
import { randomRange } from '../../Commons/Helpers';
import { SHIFT_INCREMENT_PX } from '../Game';
import * as uuid from 'uuid';

const GENERATION_DELAY_MS = 5000;

export interface IMonsterValues {
	nextMonster: () => IMonster | undefined;
	moveMonster: (monster: IMonster) => void;
	hitMonster: (index: number) => boolean;
	killerMonster: IMonster | undefined;
}

export const useMonster = (
	monsters: IMonster[],
	setMonsters: Dispatch<SetStateAction<IMonster[]>>,
	walls: IWall[]
): IMonsterValues => {
	const generateTimeout = useRef<NodeJS.Timeout>();
	const [killerMonster, setKillerMonster] = useState<IMonster>();
	const { playerPosition } = usePlayerContext();
	const { isMonsterKnockingWall } = useCollisions();

	const nextMonster = useCallback(() => {
		let monster = monsters[0];
		monsters.forEach((m) => {
			if (m.left > PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX / 2) {
				if (m.left < monster.left) {
					monster.left = m.left;
				}
			}
		});
		return monster;
	}, [monsters]);

	// TODO : not working, to move into useCollisions
	const hitMonster = useCallback(
		(index: number) => {
			const matchHorizontal = monsters.some(
				(m) =>
					(PLAYER_LEFT_POSITION_PX - PLAYER_WIDTH_PX) / 2 > m.left &&
					(PLAYER_LEFT_POSITION_PX + PLAYER_WIDTH_PX) / 2 < m.left
			);
			const matchVertical = monsters.some(
				(m) =>
					playerPosition[index] - PLAYER_HEIGHT_PX / 2 > m.top &&
					playerPosition[index] + PLAYER_HEIGHT_PX / 2 < m.top
			);
			if (matchHorizontal) {
				setKillerMonster(monsters[index]);
			}
			return matchHorizontal && matchVertical;
		},
		[monsters, playerPosition]
	);

	const moveMonster = useCallback(
		(monster: IMonster) => {
			let top = 0,
				left = 0;
			if (
				Math.random() > 0.5 &&
				monster.top + PLAYER_MOVE_VALUE_PX < window.innerHeight
			) {
				top = monster.top + PLAYER_MOVE_VALUE_PX;
			} else if (monster.top - PLAYER_MOVE_VALUE_PX > 0) {
				top = monster.top - PLAYER_MOVE_VALUE_PX;
			}
			left = monster.left - SHIFT_INCREMENT_PX;
			setMonsters((monsters) => {
				const monster = monsters.find((m) => m === monster);
				monster.top = top;
				monster.left = left;
				return [...monsters];
			});
		},
		[setMonsters]
	);

	useEffect(() => {
		const generate = () => {
			setMonsters((monsters) => [
				...monsters.filter((m) => m.left && m.top <= window.innerHeight),
				{
					id: uuid.v4(),
					left: randomRange(50, window.innerWidth - MONSTER_WIDTH_PX / 2),
					top: randomRange(0, window.innerHeight - MONSTER_HEIGHT_PX / 2),
				},
			]);
			generateTimeout.current = setTimeout(generate, GENERATION_DELAY_MS);
		};
		!generateTimeout.current && generate();
	}, [setMonsters]);

	useEffect(() => {
		setMonsters((monsters) => monsters.filter((m) => !isMonsterKnockingWall(m, walls)));
	}, [setMonsters, walls, isMonsterKnockingWall]);

	return {
		nextMonster,
		moveMonster,
		hitMonster,
		killerMonster,
	};
};
