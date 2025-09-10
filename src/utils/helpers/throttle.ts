// // Usage examples:
// const logMessage = (msg: string) => console.log(msg)
// const throttledLog = throttle(logMessage, 1000)

// const apiCall = async (data: object) => fetch('/api', { body: JSON.stringify(data) })
// const throttledApiCall = throttle(apiCall, 500)

// // In Vue composables or components:
// const handleScroll = throttle(() => {
//   console.log('Scrolling...', window.scrollY)
// }, 200)

const throttle = <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => {
  let isThrottled = false

  return (...args: Parameters<T>) => {
    if (isThrottled) return

    isThrottled = true
    const result = func(...args)

    setTimeout(() => {
      isThrottled = false
    }, delay)

    return result
  }
}

export default throttle
