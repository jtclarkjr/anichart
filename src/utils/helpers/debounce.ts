// // Usage examples:
// const search = (query: string) => console.log('Searching:', query)
// const debouncedSearch = debounce(search, 500)

// const saveForm = async (data: object) => fetch('/api/save', {
//   method: 'POST',
//   body: JSON.stringify(data)
// })
// const debouncedSave = debounce(saveForm, 1000)

// // In Vue composables:
// const handleInput = debounce((event: Event) => {
//   const target = event.target as HTMLInputElement
//   console.log('User input:', target.value)
// }, 300)

const debounce = <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      func(...args)
    }, delay)
  }
}

export default debounce
