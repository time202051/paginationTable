<!--
 * @fileName: baseTable.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:25:22
 * @description: 表格组件
!-->
<template>
  <el-table
    ref="tableRef"
    :data="tableData"
    v-bind="$attrs"
    v-on="$listeners"
    :class="ns.b()"
  >
    <!-- 勾选框 -->
    <el-table-column
      v-if="enableSelect"
      type="selection"
      v-bind="{
        align: 'center',
        fixed: true,
        ...selectionAttrs,
      }"
    ></el-table-column>
    <!-- 序号 -->
    <el-table-column
      v-if="enableIndex"
      align="center"
      label="序号"
      :width="50"
      type="index"
    ></el-table-column>
    <template v-for="(item, index) in tableColumns">
      <BaseTableColumn
        v-if="isShow(item, tableColumns, tableData)"
        :key="index"
        :item="item"
        :align="item.align || 'center'"
        v-bind="{ ...item, ...item.attrs }"
        v-on="$listeners"
      >
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </BaseTableColumn>
    </template>
    <template slot="empty">
      <dyt-empty type="empty-1"></dyt-empty>
    </template>
  </el-table>
</template>
<script>
import { NameSpace } from "../../utils/nameSpace";
import BaseTableColumn from "./BaseTableColumn.vue";
// interface IColumn {
//   label: string
//   prop: string
//   hide?: boolean | ((item: IColumn, tableColumns: IColumn[], tableData: any[]) => boolean)
//   slot?:string //插槽
//   render?: (renderParams:{ctx: any, row:any, value: any, index:Number}) => vNode
//   [attrName:string]: Table-column Attributes //table
// }

export default {
  name: "BaseTable",
  components: {
    BaseTableColumn,
  },
  props: {
    //表格数据
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
    //表格配置
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    //是否开启 序列号
    enableIndex: {
      type: Boolean,
      default: true,
    },
    enableSelect: {
      type: Boolean,
      default: false,
    },
    selectionAttrs: {
      type: Object,
      default: () => {},
    },
    align: {
      type: String,
      default: "center", //"left" | "center" | "right"
    },
  },
  data() {
    return {
      tableData: this.data,
      tableColumns: this.columns,
      ns: new NameSpace("baseTable"),
    };
  },
  computed: {},
  watch: {
    //父data,子tableData 保持一致
    data: {
      handler(val) {
        this.tableData = val;
      },
      deep: true,
    },
    columns: {
      handler(val) {
        this.tableColumns = val;
      },
      deep: true,
      immediate: true,
    },
  },
  created() {},
  mounted() {
    this.extendMethod();
  },
  methods: {
    //列显示隐藏
    isShow(item, tableColumns, tableData) {
      //判断hide是否存在
      const { hide } = item || {};
      if (!hide) return true;
      if (typeof hide == "boolean") return !hide;
      if (typeof hide == "function")
        return !hide({ item, tableColumns, tableData });
      return true;
    },
    extendMethod() {
      const refMethod = Object.entries(this.$refs["tableRef"]);
      for (const [key, value] of refMethod) {
        if (!(key.includes("$") || key.includes("_"))) {
          this[key] = value;
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.dyt-baseTable {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/deep/ .is-disabled:hover {
  color: #c0c4cc !important;
}
</style>
