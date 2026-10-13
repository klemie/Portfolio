import {LANDING_SCROLL_STAGES} from './landingTransition'

export const TRAVEL_SHARE = 0.6
export const DWELL_SHARE = 1 - TRAVEL_SHARE
export const FINISH_SCROLL_STAGES = 1.2

// The opening supplies the first approach; all stops get the same dwell.
export const rideStagesFor = (count: number) =>
  LANDING_SCROLL_STAGES + (count > 0 ? DWELL_SHARE + count - 1 : 0)

export const scrollStagesFor = (count: number) =>
  rideStagesFor(count) + (count > 0 ? FINISH_SCROLL_STAGES : 0)

/** Target the same settled point in every stop's dwell. */
export const stopProgressFor = (index: number, count: number, dwell = 0.55) => {
  const arrival = index === 0
    ? LANDING_SCROLL_STAGES
    : LANDING_SCROLL_STAGES + DWELL_SHARE + index - 1 + TRAVEL_SHARE
  return (arrival + DWELL_SHARE * dwell) / scrollStagesFor(count)
}
