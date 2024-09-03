<!--
 * @fileName: RenderCol.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:25:15
 * @description:
!-->
<script>
export default {
  name: 'RenderCol',
  functional: true, //使组件无状态 (没有 data) 和无实例 (没有 this 上下文)。他们用一个简单的 render 函数返回虚拟节点使它们渲染的代价更小。
  props: {
    row: Object,
    render: Function,
    index: Number,
    column: {
      type: Object,
      default: null
    }
  },
  render(h, ctx) {
    const params = {
      row: ctx.props.row,
      index: ctx.props.index
    }
    if (ctx.props.column) params.column = ctx.props.column
    //prop当前单元格展示的值, row行数据, index索引
    const renderParams = {
      ctx: ctx,
      row: ctx.props.row,
      value: ctx.props?.row[ctx.props?.column?.prop],
      index: ctx.props.index
    }
    // const vNode = ctx.props.render(renderParams) //创建VNode
    return ctx.props.render(renderParams) //创建VNode
  }
}
</script>
