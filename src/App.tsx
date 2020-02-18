import React from "react";
import Game from "./Components/Game";
import PlayerContext from "./Components/Player/Context";

const App = () => (
	<PlayerContext>
		<Game />
	</PlayerContext>
);

export default App;
