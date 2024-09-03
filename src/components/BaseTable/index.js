import BaseTable from './src'

BaseTable.install = function (Vue) {
  Vue.component(BaseTable.name, BaseTable)
}

export default BaseTable
