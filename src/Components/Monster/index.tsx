import React, { CSSProperties } from 'react';
import MonsterImage from './assets/Monster.gif';
import { MONSTER_WIDTH_PX, MONSTER_HEIGHT_PX } from '../../Commons/DefaultValues';

const style: CSSProperties = {
	position: 'absolute',
	width: `${MONSTER_WIDTH_PX}px`,
	height: `${MONSTER_HEIGHT_PX}px`,
};

export interface IMonster {
	id: string;
	top: number;
	left: number;
}

interface IProps {
	monster: IMonster;
}

const Monster = ({ monster }: IProps) => {
	return (
		<img
			src={MonsterImage}
			alt='monster'
			style={{
				...style,
				top: monster.top,
				left: monster.left,
			}}
		/>
	);
};

export default Monster;
