<!--
 * @fileName: renderComp.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:27:20
 * @description: render实现表单中的自定义内容
!-->
<script>
export default {
  name: 'RenderComp',
  props: {
    createElementFunc: Function,
    item: {
      type: Object,
      required: true
    }
  },
  render(h, ctx) {
    return this.createElementFunc(h, ctx)
  }
}
</script>
