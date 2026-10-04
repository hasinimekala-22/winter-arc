export function getStoredData<T>(
  key: string,
  fallback: T
): T {

  try {

    const raw =
      localStorage.getItem(key)


    if (!raw) {
      return fallback
    }


    const parsed =
      JSON.parse(raw)


    if (
      parsed === null ||
      parsed === undefined
    ) {
      return fallback
    }


    return parsed as T

  } catch {

    return fallback

  }

}


export function setStoredData<T>(
  key: string,
  value: T
): void {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    )

  } catch (error) {

    console.error(
      'Winter ARC storage error:',
      error
    )

  }

}


export function removeStoredData(
  key: string
): void {

  try {

    localStorage.removeItem(
      key
    )

  } catch (error) {

    console.error(
      'Winter ARC storage removal error:',
      error
    )

  }

}


export function hasStoredData(
  key: string
): boolean {

  try {

    return (
      localStorage.getItem(key) !==
      null
    )

  } catch {

    return false

  }

}