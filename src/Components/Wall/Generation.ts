import { Direction } from "../../Commons/Direction";
import { WALL_BLOCKS_MAX_LENGTH } from "../../Commons/DefaultValues";
import { WALLS_SPACE_PX } from "../Game";

// Handle consistency for many walls generated next to each other
// Increasing this value will make the game easier to play
const GENERATION_TOLERANCE: number = 3;

let previousLength: number;
let previousDirection: number;

export interface IWallValues {
  length: number;
  leftPosition: number;
  direction: Direction;
}

const useGenerationTolerance = (
  direction: Direction,
  length: number
): number => {
  if (GENERATION_TOLERANCE > 0) {
    if (previousDirection !== direction) {
      while (
        Math.abs(previousLength - length) < GENERATION_TOLERANCE &&
        length > 1
      ) {
        length--;
      }
    }
    previousLength = length;
    previousDirection = direction;
  }
  return length;
};

export const useWallGeneration = (): ((index: number) => IWallValues) => {
  const randomIdx: number = Math.floor(Math.random() * Math.floor(2));
  const direction: number =
    randomIdx % 2 === 0 ? Direction.TOP : Direction.BOTTOM;

  let length: number = Math.floor(
    Math.random() * (WALL_BLOCKS_MAX_LENGTH - 1) + 1
  );
  length = useGenerationTolerance(direction, length);

  return (index: number) => {
    const leftPosition: number = index * WALLS_SPACE_PX;

    return {
      length,
      direction,
      leftPosition
    };
  };
};
