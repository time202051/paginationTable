import * as components from './components'

export function registerComponents(Vue) {
  for (const [name, component] of Object.entries(components)) {
    Vue.component(name, component);
  }
}

export { classes, components };
