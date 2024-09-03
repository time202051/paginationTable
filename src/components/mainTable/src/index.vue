<!--
 * @fileName: mainTable.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:23:32
 * @description:表格组件（带搜索条件，分页）
!-->
<template>
  <div :class="ns.b()">
    <div :class="ns.b('search')">
      <!-- 搜索框 -->
      <div :class="ns.e('searchForm')">
        <MainForm :formData="searchData" :fieldList="fieldList" :receiverMap="receiverMap" ref="mainFormRef" v-bind="{ size: searchSize, ...$attrs.formAttrs }" v-if="showSearch">
          <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
            <slot :name="name" v-bind="data"></slot>
          </template>
          <template #btnSlot="{ formData }">
            <el-button type="primary" :size="searchSize" @click="onSubmit(formData)">搜索</el-button>
            <el-button :size="searchSize" @click="onReset(formData)">重置</el-button>
          </template>
        </MainForm>
        <!-- 和搜索重置按钮space-between的其他功能按钮 为了和内部mainForm的margin-bottom保持一致 -->
        <el-form ref="form">
          <el-form-item>
            <div v-if="$slots.otherButtons">
              <slot name="otherButtons"></slot>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <!-- 查询条件换行后的插槽 -->
      <div class="mb12" v-if="$slots.search">
        <slot name="search"></slot>
      </div>
    </div>
    <div :class="ns.b('table')">
      <BaseTable ref="baseTableRef" :data="table.data" :columns="columns" border v-loading="table.loading" :height="height" :size="tableSize" v-bind="$attrs" v-on="$listeners">
        <!-- enableSelect -->
        <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </BaseTable>
    </div>
    <div :class="ns.b('footer')" v-if="!table.options?.hidePagination">
      <el-pagination
        :current-page.sync="table.pageIndex"
        :page-size.sync="table.pageSize"
        :total="table.total"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        layout="total, prev, pager, next, sizes"
        @current-change="table.run()"
        @size-change="table.run()"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import BaseTable from '@/common/components/common/DytMainTable/components/BaseTable/src/index.vue'
import MainForm from '@/common/components/common/DytMainForm/src/index.vue'
import { NameSpace } from '@/common/utils/nameSpace'

export default {
  components: {
    BaseTable,
    MainForm
  },
  props: {
    // 表格配置项
    // as PaginationTable
    table: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 表格列定义
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    searchData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    fieldList: {
      type: Array,
      default: () => {
        return []
      }
    },
    receiverMap: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    },
    height: {
      type: [String, Number],
      default: '100%'
    },
    //搜索框，表格的size。本公司搜索框组件默认都是small，表格默认mini 字体大小14px
    searchSize: {
      type: String,
      default: 'mini' //medium / small / mini
    },
    tableSize: {
      type: String,
      default: 'mini' //medium / small / mini
    }
  },
  data() {
    return {
      ns: new NameSpace('mainTable')
    }
  },
  mounted() {},
  methods: {
    onSubmit(formData) {
      this.$refs.mainFormRef
        .validate()
        .then(res => {
          this.$emit('submit', formData)
          this.table.refresh() //直接执行。接口前钩子可以通过PaginationTable的onBefore实现
        })
        .catch(err => {
          console.log('校验失败', err)
        })
    },
    onReset(formData) {
      this.$refs.mainFormRef.onCancel()
      this.$emit('reset', formData)
      this.table.refresh() //重置表格数据
    }
  }
}
</script>

<style lang="scss" scoped>
.dyt-mainTable {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dyt-mainTable-search {
  }

  .dyt-mainTable-table {
    // flex-grow: 1; /* 撑满剩余高度 */
    flex: 1;
    overflow: auto;
    // height: 100%;
  }

  .dyt-mainTable-footer {
    display: flex;
    justify-content: right;
    // 保证分页和table右对齐
    /deep/.el-pagination {
      padding: 10px 0;
      .el-pagination__sizes {
        margin-right: 0;
        .el-input {
          margin-right: 0;
        }
      }
    }
  }
}

/deep/ .el-table__row {
  .cell {
    span {
      white-space: nowrap;
    }
  }
}
.dyt-mainTable__searchForm {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
//产品要求，表格的mini字体大小14px,按钮高度32px
/deep/.el-table--mini,
.el-button--small {
  font-size: 14px !important;
}
// .dyt-mainTable__searchForm {
//   /deep/.el-button--small {
//     height: 32px !important;
//   }
// }
.dyt-mainTable-table {
  /deep/.el-button {
    height: auto !important;
  }
}
</style>
