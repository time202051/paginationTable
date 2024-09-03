<!--
 * @fileName: MainTableExamples.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:24:47
 * @description:
!-->
<template>
  <MainTable
    :table="table"
    :columns="columns"
    :searchData="searchData"
    :fieldList="fieldList"
    :receiverMap="receiverMap"
    ref="mainTableRef"
    @selection-change="selectionChange"
    :formAttrs="{
      labelPosition: '',
      column: 5,
      colon: false,
    }"
    @submit="onSubmit"
  >
    <template #yy="{ row }">
      <div class="img-box">
        <img
          v-if="row.icon"
          :src="row.icon"
          alt=""
          style="width: 20px; height: 20px"
        />
        <svg-icon v-else style="font-size: 20px" iconClass="weChat" />
      </div>
    </template>
    <template #ageSlot>
      <div>18</div>
    </template>
    <template #inputPeraend>
      <i class="el-icon-eleme"></i>
    </template>
    <template #search>
      <el-radio-group v-model="searchData.radio">
        <el-radio-button label="上海"></el-radio-button>
        <el-radio-button label="北京"></el-radio-button>
        <el-radio-button label="广州"></el-radio-button>
        <el-radio-button label="深圳"></el-radio-button>
      </el-radio-group>
    </template>
    <template #btnAfterSlot>
      <el-button type="primary">导出</el-button>
    </template>
  </MainTable>
</template>

<script>
import { Type } from "../mainForm/src/type.js";
import MainTable from "../mainTable/src/index.vue";
import { PaginationTable } from "../mainTable/src/PaginationTable.js";
// import { loadMutualFriendNew } from "@/common/api/caseDetails/sampleAnalysis/baseStationWarning";
import MainForm from "../mainForm/src/index.vue";
// import { mapGetters } from "vuex";

export default {
  components: {
    MainTable,
    MainForm,
  },
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
  computed: {
    // 检材列表
    // ...mapGetters(["app_type_list"]),
  },
  data() {
    return {
      columns: [
        {
          slot: "yy",
          label: "应用",
          width: 100,
        },
        {
          prop: "name",
          label: "账号",
          render: ({ ctx, row }) => {
            return (
              <div>
                {row.name}({row.value})
              </div>
            );
          },
          hide: ({ item }) => {
            return false;
          },
        },
        {
          prop: "totalCommunicationNum",
          label: "累计互动频次",
          sortable: true,
        },
        {
          prop: "num",
          label: "涉案人统计",
          sortable: true,
        },
        {
          label: "操作",
          render: ({ row }) => {
            return (
              <el-button
                type="text"
                disabled={!row.chatNum}
                onClick={(e) => this.chatDetail(row)}
              >
                查看聊天记录
              </el-button>
            );
          },
        },
      ],
      table: null,
      options: {
        manual: true,
        ready: true,
        hidePagination: false,
        // pageSize: 50,
        // pollingInterval: 2000,
        debounceInterval: 500,
        // throttleInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        loadingKeep: 1000,
        params: (params) => {
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
          const temp = {
            ...this.params,
            ...this.formData,
            typeList,
            direction: "desc",
            sortBy: "num",
          };
          console.log("mainTable接口参数", temp, this.table);
          return temp;
        },
        onBefore: (params) => {
          console.log("mainTable-onBefore", params);
        },
        onRes: (res) => {
          console.log("mainTable-onRes", res);
        },
        onSuccess: this.onSuccess,
        onError: function (error, params) {
          console.log("mainTable-onError", error, params);
        },
      },
      searchData: {
        accountId: "111111",
        name2: "",
        nickName: "",
        suspectPerson: "",
        timepicker: "",
        dataTime: "",
        years: [],
        radio: "上海",
      },
      // 动态下拉框数据
      receiverMap: {
        source: [],
      },
      fieldList: [
        {
          type: Type.SELECT,
          label: "应用类型",
          prop: "name2",
          attrs: {
            "visible-change": (formData, e) => {
              console.log("下拉框出现/隐藏时触发", formData, e);
            },
          },
          childAttrs: {
            options: "source",
            value: "appType",
            label: "appName",
          },
        },
        {
          type: Type.INPUT,
          label: "昵称",
          prop: "nickName",
          attrs: {
            focus: (val, scope, a) => this.accountFocus(val, scope, a),
            clear: (scope) => this.accountClear(scope),
            blur: (val, scope) => this.accountBlur(val, scope),
            change: (val) => {
              console.log("切换", val);
            },
          },
          required: false,
        },
        {
          type: Type.INPUT,
          label: "账号",
          prop: "accountId",
          attrs: {
            disabled: () => {
              return !this.searchData.nickName;
            },
          },
          required: () => {
            return this.searchData.nickName;
          },
        },
        {
          type: Type.SWITCH,
          label: "过滤到案嫌疑人",
          prop: "suspectPerson",
          attrs: {},
          hide: true,
        },
        {
          type: Type.TIMESELECT,
          label: "时间",
          prop: "timepicker",
          attrs: {},
          hide: () => {
            return this.searchData.nickName == "123";
          },
        },
        {
          type: Type.DATEPICKER,
          label: "时间1",
          prop: "dataTime",
          attrs: {
            type: "month",
          },
        },
        {
          type: Type.DATEPICKER,
          label: "多个年",
          prop: "years",
          attrs: {
            type: "years",
          },
          rules: [],
          // 是否开启校验规则
          validator: false,
        },
      ],
    };
  },
  watch: {
    params: {
      handler(val, oldVal) {
        if (this.table) this.table.run();
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    // this.receiverMap.source = this.$utils.format.getAppType(
    //   this.app_type_list,
    //   [1, 6]
    // );
    const loadMutualFriendNew = "这是接口";
    this.table = new PaginationTable(loadMutualFriendNew, this.options);
  },
  mounted() {
    console.log("000012", this.fieldList, this.receiverMap);
  },
  methods: {
    selectionChange(selection) {
      // console.log(selection)
    },
    accountFocus(val, scope, a) {
      console.log("账号聚焦事件", val, scope, a);
    },
    accountBlur(val, scope) {
      console.log("账号失焦事件", val, scope);
    },
    accountClear(scope) {
      console.log("账号清空事件", scope);
    },
    onSubmit() {
      this.table.run();
    },
    chatDetail() {},
  },
};
</script>
