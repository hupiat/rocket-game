import React from 'react';
import Game from './Components/Game';
import PlayerContext from './Components/Player/Context';
import NeatBotContext, { useNeatBotContext, AI_NEAT_BOT } from './AI_NEAT_BOT/Context';

const NeatBotInitializer = () => {
	useNeatBotContext();
	return <></>;
};

const App = () =>
	AI_NEAT_BOT ? (
		<NeatBotContext>
			<PlayerContext>
				<NeatBotInitializer />
				<Game />
			</PlayerContext>
		</NeatBotContext>
	) : (
    <NeatBotContext>
		<PlayerContext>
			<Game />
		</PlayerContext>
    </NeatBotContext>
	);

export default App;
