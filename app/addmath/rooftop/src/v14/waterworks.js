export const WATERWORKS_STATE = Object.freeze({
  LOCKED: 'LOCKED',
  CONFIGURED: 'CONFIGURED',
  RUNNING: 'RUNNING',
  NON_TARGET_RESULT: 'NON_TARGET_RESULT',
  TARGET_REACHED: 'TARGET_REACHED',
  CROSSING_ACTIVATING: 'CROSSING_ACTIVATING',
  CROSSING_SAFE: 'CROSSING_SAFE',
});

export function evaluateWaterOrder(order, input = 3) {
  if (!['fg', 'gf'].includes(order) || !Number.isInteger(input)) return null;
  const f = x => 2 * x + 1;
  const g = x => 3 * x - 2;
  const first = order === 'fg' ? f : g;
  const second = order === 'fg' ? g : f;
  const intermediate = first(input);
  return {
    order,
    input,
    intermediate,
    output: second(intermediate),
    stages: order === 'fg' ? ['F', 'G'] : ['G', 'F'],
  };
}

export function transitionWaterworks(state, event, result = null) {
  const S = WATERWORKS_STATE;
  if (event === 'choose-order' && ['fg', 'gf'].includes(result) && [S.LOCKED, S.CONFIGURED, S.NON_TARGET_RESULT].includes(state)) return S.CONFIGURED;
  if (event === 'activate' && [S.CONFIGURED, S.NON_TARGET_RESULT].includes(state)) return S.RUNNING;
  if (event === 'result' && state === S.RUNNING && Number.isFinite(result)) return result === 19 ? S.TARGET_REACHED : S.NON_TARGET_RESULT;
  if (event === 'begin-crossing' && state === S.TARGET_REACHED) return S.CROSSING_ACTIVATING;
  if (event === 'crossing-safe' && state === S.CROSSING_ACTIVATING) return S.CROSSING_SAFE;
  return state;
}

export function recoverWaterworksState(state, order) {
  const S = WATERWORKS_STATE;
  if (state === S.CROSSING_SAFE || state === S.TARGET_REACHED || state === S.CROSSING_ACTIVATING) return order === 'fg' ? S.CROSSING_SAFE : S.LOCKED;
  if (state === S.RUNNING) return ['fg', 'gf'].includes(order) ? S.CONFIGURED : S.LOCKED;
  if (state === S.CONFIGURED || state === S.NON_TARGET_RESULT) return ['fg', 'gf'].includes(order) ? state : S.LOCKED;
  return S.LOCKED;
}
