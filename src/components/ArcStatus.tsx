import {
  getWorkloadSummary
} from '../services/planningEngine'

import {
  getWinterArcState
} from '../services/winterArcState'


function ArcStatus() {

  const state =
    getWinterArcState()

  const workload =
    getWorkloadSummary()


  let status = 'Stable'
  let message = 'Keep following the current plan.'


  if (workload.high > 0) {

    status = 'Action Required'

    message =
      `${workload.high} high-priority task${
        workload.high === 1 ? '' : 's'
      } need attention.`

  } else if (
    state.habits.sleep &&
    Number(state.habits.sleep) < 6
  ) {

    status = 'Protect Energy'

    message =
      'Recorded sleep is low. Avoid unnecessary late-night work.'

  } else if (
    state.streak > 0
  ) {

    status = 'In Motion'

    message =
      `${state.streak}-day start streak. Keep the momentum.`

  }


  return (

    <div className="arc-status-badge">

      <div>

        <span className="arc-status-label">
          ARC STATUS
        </span>

        <strong>
          {status}
        </strong>

      </div>

      <p>
        {message}
      </p>

    </div>

  )

}


export default ArcStatus