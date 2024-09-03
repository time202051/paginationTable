<!--
 * @fileName: BaseTableColumn.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:25:30
 * @description: el-table-column的封装,递归实现多层
!-->
<template>
  <el-table-column v-bind="$attrs" v-on="$listeners" :show-overflow-tooltip="showOverflowTooltip">
    <!-- el-table-column内置插槽 -->
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
    <!-- 多级表头 -->
    <template v-if="item.children && Array.isArray(item.children) && item.children.length">
      <BaseTableColumn v-for="(itemC, index) in item.children" :key="index" :item="itemC"></BaseTableColumn>
    </template>
    <!-- 单元格显示内容 (1.render 2.slot 3.默认展示) -->
    <template #default="scope" v-if="!item.children || !item.children?.length">
      <!-- render渲染 -->
      <RenderCol v-if="item.render" :column="item" :row="scope.row" :render="item.render" :index="scope.$index"></RenderCol>
      <!-- 自定义插槽 -->
      <slot v-else-if="item.slot" :name="item.slot" :scope="scope" :row="scope.row"></slot>
      <!-- 自定义组件渲染 -->
      <!-- 默认展示prop字段 -->
      <span v-else>{{ scope.row[item.prop] }}</span>
    </template>
  </el-table-column>
</template>

<script>
import RenderCol from './RenderCol.vue'

export default {
  name: 'BaseTableColumn',
  components: { RenderCol },
  props: {
    //每列数据
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    align: {
      type: String,
      default: 'center'
    }
  },
  computed: {
    //是否需开启文本提示。 因为 columns中手动添加序号，并合并单元格时候。el-tooltip宽度会超出单元格导致序号文本错位 (可能el-table内部bug)
    showOverflowTooltip() {
      if (Object.keys(this.item).includes('showOverflowTooltip')) {
        return this.item.showOverflowTooltip
      } else {
        return true
      }
    }
  }
}
</script>
