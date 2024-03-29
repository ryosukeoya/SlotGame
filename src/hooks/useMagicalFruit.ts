import { useState, useEffect, useCallback } from 'react';
import { SlotMachine, SlotMachineAction } from '~/models/slotMachines';
import { MAGICAL_FRUIT_FLAGS } from '~/models/slotMachines/magicalFruit';
import { useSlotMachine } from './useSlotMachine';
import { isBetweenNumber } from '~/utils/number';

export const useMagicalFruit = (magicalFruitModel: SlotMachine) => {
  const [superJackpotTimes, setSuperJackpotTimes] = useState<number>(0);
  const [jackpotTimes, setJackpotTimes] = useState<number>(0);
  const [melonTimes, setMelonTimes] = useState<number>(0);

  const {
    changeModel,
    changeSettingNumber,
    betMax,
    playGame,
    changePossibleGame,
    playAutomated,
    clearSlotMachineData,
    setDiffMedal,
    setResultHistory,
    modelNumber,
    settingNumber,
    randomNumberResult,
    resultHistory,
    diffMedal,
    canGame,
  } = useSlotMachine();

  useEffect(() => {
    try {
      result();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomNumberResult]);

  const getAction = useCallback(<T extends number>(slotMachine: SlotMachine, randomNumberResult: number, settingNumber: T): SlotMachineAction => {
    const action = slotMachine.actions.find((action: SlotMachineAction) => {
      if (isBetweenNumber(randomNumberResult, action.range[settingNumber][0], action.range[settingNumber][1])) return action.flag;
    });
    if (!action) throw new Error(`"${randomNumberResult}" could not get the action`);
    return action;
  }, []);

  const result = useCallback(() => {
    if (!randomNumberResult) return;
    const action = getAction(magicalFruitModel, randomNumberResult, settingNumber);
    setDiffMedal((prevDiffMedal) => prevDiffMedal + action.payout);
    action['flag'] === MAGICAL_FRUIT_FLAGS[0] && setSuperJackpotTimes((prevSuperJackpotTimes) => prevSuperJackpotTimes + 1);
    action['flag'] === MAGICAL_FRUIT_FLAGS[1] && setJackpotTimes((prevJackpotTimes) => prevJackpotTimes + 1);
    action['flag'] === MAGICAL_FRUIT_FLAGS[3] && setMelonTimes((prevMelonTimes) => prevMelonTimes + 1);
    // TODO:要素数が多くなると遅くなる、stateを使わずにarray.push使うとか？
    setResultHistory((prevResultHistory) => [...prevResultHistory, { date: new Date(), diffMedal: diffMedal + action.payout }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffMedal, getAction, magicalFruitModel, randomNumberResult, settingNumber]);

  // 成立役を取得する
  const getSatisfiedHand = useCallback((): string | undefined => {
    if (!randomNumberResult) return;
    try {
      return getAction(magicalFruitModel, randomNumberResult, settingNumber)['flag'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e.message);
    }
  }, [magicalFruitModel,getAction, randomNumberResult, settingNumber]);

  const clearAll = useCallback(() => {
    clearSlotMachineData();
    setSuperJackpotTimes(0);
    setJackpotTimes(0);
    setMelonTimes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const action = { changeModel, changeSettingNumber, betMax, playGame, changePossibleGame, playAutomated, getSatisfiedHand, clearAll };
  const property = { modelNumber, settingNumber, resultHistory, diffMedal, canGame, melonTimes, superJackpotTimes, jackpotTimes };

  return { action, property };
};
