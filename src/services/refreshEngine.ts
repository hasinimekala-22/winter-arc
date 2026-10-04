const WINTER_ARC_REFRESH = 'winterArcRefresh'

export function refreshWinterArc() {
  window.dispatchEvent(
    new Event(WINTER_ARC_REFRESH)
  )
}

export function listenForWinterArcRefresh(
  callback: () => void
) {
  window.addEventListener(
    WINTER_ARC_REFRESH,
    callback
  )

  return () => {
    window.removeEventListener(
      WINTER_ARC_REFRESH,
      callback
    )
  }
}

export function listenForCrossTabRefresh(
  callback: () => void
) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === 'winterArcState' ||
      event.key === 'winterArcTasks'
    ) {
      callback()
    }
  }

  window.addEventListener(
    'storage',
    handleStorage
  )

  return () => {
    window.removeEventListener(
      'storage',
      handleStorage
    )
  }
}