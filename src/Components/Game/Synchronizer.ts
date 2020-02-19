import { useRef } from "react";

interface ISynchronizerValues {
	synchronize: (index: number, callback: () => void) => void;
}

interface IQueueObject {
	callback: () => void;
	index: number;
}

export const useSynchronizer = (
	functionsCount: number
): ISynchronizerValues => {
	const orderState = useRef<number>(-1);
	const queue = useRef<IQueueObject[]>([]);

	const synchronize = (index: number, callback: () => void) => {
		if (orderState.current === index - 1) {
			callback();
			orderState.current++;
			if (orderState.current === functionsCount) {
				orderState.current = -1;
			}
		} else {
			const next = queue.current.find(
				element => element.index - 1 === orderState.current
			);
			if (next) {
				next.callback();
			} else {
				queue.current.push({
					index,
					callback
				});
			}
		}
	};

	return {
		synchronize
	};
};
