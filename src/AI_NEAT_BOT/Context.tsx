import React, { Dispatch } from 'react';
import { useCallback, useState, useEffect, useContext } from 'react';
import { IWallValues } from '../Components/Wall/Generation';
import { WALL_HEIGHT_PX } from '../Commons/DefaultValues';

export const AI_NEAT_BOT = false;
export const AI_NEAT_BOTS_DISPARITY_PX = 300;
export const AI_NEAT_BOTS_AUTO_RESTART_MS = 1000;

const PORT = 8080;
const URL = `http://localhost:${PORT}`;

interface Data {
  id: number;
  score: number;
  rocket_top: number;
  wall_direction: number;
  wall_left: number;
  wall_length: number;
}

interface INeatBotContext {
  ask_model: (
    score: number[],
    playerPosition: number[],
    walls: IWallValues[]
  ) => Promise<boolean[]>;
  step_generation: (
    score: number[],
    playerPosition: number[],
    walls: IWallValues[]
  ) => Promise<void>;
  count_individuals: number;
  count_generation: number;
  setCount_generation: Dispatch<number>;
}

const SetupNeatBotContext = React.createContext<INeatBotContext | undefined>(undefined);

interface IProps {
  children?: JSX.Element | JSX.Element[] | Array<JSX.Element | undefined>;
}

const NeatBotContext = ({ children }: IProps) => {
  const [count_individuals, setCount_individuals] = useState<number>(0);
  const [count_generation, setCount_generation] = useState<number>(0);

  const formatData = useCallback(
    (score: number[], playerPosition: number[], walls?: IWallValues[]): string =>
      JSON.stringify(
        playerPosition.map(
          (_, i): Data => {
            const activeWall = Array.isArray(walls) ? walls[i] : walls;
            return {
              id: i,
              score: score[i],
              rocket_top: playerPosition[i],
              wall_direction: activeWall && activeWall.direction === 'bottom' ? 1 : 0,
              wall_left: activeWall ? activeWall.leftPosition : 0,
              wall_length: activeWall ? activeWall.length * WALL_HEIGHT_PX : 0,
            };
          }
        )
      ),
    []
  );

  const send = useCallback(async (suffix: string): Promise<any> => {
    try {
      const response = await fetch(`${URL}/${suffix}`);
      return await response.text();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const ask_model = useCallback(
    async (
      score: number[],
      playerPosition: number[],
      walls: IWallValues[]
    ): Promise<boolean[]> => {
      const datas = formatData(score, playerPosition, walls);
      const predictions = datas !== '[]' && (await send(`ask_model?datas=${datas}&max_width=${window.innerWidth}&max_height=${window.innerHeight}`));
      return predictions ? JSON.parse(predictions.toLowerCase()) : [];
    },
    [send, formatData]
  );

  const step_generation = useCallback(
    async (
      score: number[],
      playerPosition: number[],
      walls: IWallValues[]
    ): Promise<void> => {
      setCount_generation(count_generation + 1);
      const datas = formatData(score, playerPosition, walls);
      datas !== '[]' && (await send(`step_generation?datas=${datas}`));
    },
    [send, formatData, count_generation, setCount_generation]
  );

  const fetchCountIndividuals = useCallback(async (): Promise<void> => {
    const count = await send('count_individuals');
    setCount_individuals(Number(count));
  }, [send, setCount_individuals]);

  useEffect(() => {
    fetchCountIndividuals();
  }, [fetchCountIndividuals]);

  return (
    <SetupNeatBotContext.Provider
      value={{
        ask_model,
        step_generation,
        count_individuals,
        count_generation,
        setCount_generation,
      }}
    >
      {children}
    </SetupNeatBotContext.Provider>
  );
};

export const useNeatBotContext = (): INeatBotContext => {
  const context = useContext(SetupNeatBotContext);
  if (!context) {
    throw Error('Context is not mounted');
  }
  return context;
};

export default NeatBotContext;
