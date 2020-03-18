import React, { CSSProperties, useMemo } from "react";
import { Direction } from "../../Commons/Direction";
import WallImage from "./assets/Wall.png";
import { WALL_WIDTH_PX, WALL_HEIGHT_PX } from "../../Commons/DefaultValues";

interface IProps {
  length: number;
  leftPosition: number;
  direction: Direction;
}

const Wall = ({ length, leftPosition, direction }: IProps) => {
  const blocks: JSX.Element[] = useMemo(
    () =>
      [...Array(length)].map((_, i) => {
        const style: CSSProperties = {
          position: "absolute",
          width: `${WALL_WIDTH_PX}px`,
          height: `${WALL_HEIGHT_PX}px`,
          left: `${leftPosition}px`
        };

        const shift: number = i * WALL_HEIGHT_PX;

        if (direction === Direction.TOP) {
          style.top = `${shift}px`;
        }
        if (direction === Direction.BOTTOM) {
          style.top = `calc(95vh - ${shift}px)`;
        }

        return <img src={WallImage} alt="wall" style={style} key={i} />;
      }),
    [leftPosition, direction, length]
  );

  return <>{blocks}</>;
};

export default Wall;
