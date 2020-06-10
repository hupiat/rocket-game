import { useRef, useState, MutableRefObject } from 'react';

export interface IPause {
	pauseRef: MutableRefObject<boolean>;
	isPaused: boolean;
	setIsPaused: (isPaused: boolean) => void;
}

export const usePause = (): IPause => {
	const pauseRef = useRef<boolean>(false);
	const [isPaused, setPauseState] = useState<boolean>(false);

	const setIsPaused = (isPaused: boolean): void => {
		pauseRef.current = isPaused;
		setPauseState(isPaused);
	};

	return {
		pauseRef,
		isPaused,
		setIsPaused,
	};
};
