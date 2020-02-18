import { useRef, useState, MutableRefObject } from "react";

interface IPauseValues {
	// We need a ref to be listened in the loop timeout
	pauseRef: MutableRefObject<boolean>;
	isPaused: boolean;
	setIsPaused: (isPaused: boolean) => void;
}

export const usePause = (): IPauseValues => {
	const pauseRef = useRef<boolean>(false);
	const [isPaused, setPauseState] = useState<boolean>(false);

	const setIsPaused = (isPaused: boolean): void => {
		pauseRef.current = isPaused;
		setPauseState(isPaused);
	};

	return {
		pauseRef,
		isPaused,
		setIsPaused
	};
};
