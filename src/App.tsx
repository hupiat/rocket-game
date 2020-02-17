import React from "react";
import Game from "./Components/Game";
import PlayerPositionContext from "./Components/Player/Position";

const App = () => (
	<PlayerPositionContext>
		<Game />
	</PlayerPositionContext>
);

export default App;
