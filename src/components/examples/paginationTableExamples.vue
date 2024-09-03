<!--
 * @fileName: paginationTableExamples.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:24:57
 * @description:
!-->
<template>
  <div :class="ns.b()">
    <div @click="getNextPage">下一页</div>
    <div @click="table.run()">查询</div>
    <div @click="table.readyChange(true)">readyOpen</div>
    <div @click="table.readyChange(false)">readyClose</div>
    <div @click="options.ready = !options.ready">ready{{ options.ready }}</div>
    <div>{{ table.data.length }}</div>
    {{ formData }}loading:{{ table.loading }}
    <div @click="changepage">{{ table.pageIndex }}=={{ table.pageSize }}</div>
    <el-pagination
      :current-page.sync="table.pageIndex"
      :page-size.sync="table.pageSize"
      :total="table.total"
      :page-sizes="[10, 20, 30, 40, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="table.run()"
      @size-change="table.run()"
    >
    </el-pagination>
  </div>
</template>

<script>
import { NameSpace } from "../../utils/nameSpace.js";
import Pagination from "../mainTable/src/pagination";
import { PaginationTable } from "../mainTable/src/PaginationTable";
// import { loadMutualFriendNew } from '@/common/api/caseDetails/sampleAnalysis/baseStationWarning'
export default {
  props: {
    formData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      ns: new NameSpace("mainTable"),
      a: 123,
      // ready: false,
      paginationData: new Pagination(100, 20),
      table: null,
      options: {
        // manual: true,
        ready: false,
        pageSize: 20,
        // pollingInterval: 2000,
        debounceInterval: 500,
        // throttleInterval: 2000,
        errorRetryCount: 3,
        // errorRetryInterval: 3000,
        loadingKeep: 1000,
        params: () => {
          let typeList;
          if (
            this.formData.typeList != "" &&
            Array.isArray(this.formData.typeList)
          ) {
            typeList = this.formData.typeList.map((item) => {
              let [appType, type] = item.split("-");
              return { appType, type };
            });
          } else {
            typeList = undefined;
          }
          const temp = { ...this.params, ...this.formData, typeList };
          console.log("00000onParams", temp, this.table);
          return temp;
        },
        onBefore: (params) => {
          console.log("000000onBefore", params);
        },
        onRes: (res) => {
          console.log("000000onRes", res);
        },
        onSuccess: this.onSuccess,
        onError: function (error, params) {
          console.log("000000onError", error, params);
          this.$message.error(error);
        },
      },
    };
  },
  watch: {
    params: {
      handler(val, oldVal) {
        console.log("000000watch", val, oldVal);
        this.$nextTick(() => {
          this.table.run();
        });
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    const loadMutualFriendNew = "这是后端的接口";
    this.table = new PaginationTable(loadMutualFriendNew, this.options);
  },
  mounted() {
    // this.table.startPolling(3000)
  },
  methods: {
    onParams(params) {
      this.$nextTick(() => {
        console.log("000000params", params, JSON.stringify(this.params));
        let typeList;
        if (
          this.formData.typeList != "" &&
          Array.isArray(this.formData.typeList)
        ) {
          typeList = this.formData.typeList.map((item) => {
            let [appType, type] = item.split("-");
            return { appType, type };
          });
        } else {
          typeList = undefined;
        }
        const temp = { ...this.params, ...this.formData, typeList };
        console.log("00000onParams", temp, this.table);
        return temp;
      });
    },
    getList() {
      console.log(this.paginationData);
    },
    getNextPage() {
      this.table.getNextPage();
      console.log(this.table);
    },
    onSuccess(data) {
      console.log("00000onSuccess", data, this.table);
    },
    changepage() {
      this.table.pageIndex = 5;
      this.table.pageSize = 50;
      this.table.run();
    },
  },
  destroyed() {
    // this.table.stopPolling()
  },
};
</script>
