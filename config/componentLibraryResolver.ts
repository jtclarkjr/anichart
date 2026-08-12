import * as ComponentLibrary from '@jtclarkjr/component-library-vue'

const COMPONENT_LIBRARY_PACKAGE = '@jtclarkjr/component-library-vue'
const COMPONENT_LIBRARY_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/
const componentLibraryComponents = new Set(
  Object.keys(ComponentLibrary).filter((name) => COMPONENT_LIBRARY_NAME_PATTERN.test(name))
)

export const componentLibraryResolver = (name: string) =>
  componentLibraryComponents.has(name) ? { name, from: COMPONENT_LIBRARY_PACKAGE } : undefined
