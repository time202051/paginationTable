<!--
 * @fileName: mainForm.vue
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:27:49
 * @description:表单组件，支持所有elementui表单组件，继承其所有属性事件
!-->
<template>
  <el-form
    v-bind="$attrs"
    v-on="$listeners"
    :model="formData"
    :rules="rules"
    :inline="false"
    ref="formRef"
    :class="ns.b()"
    :labelWidth="labelWidth"
  >
    <template v-for="(item, index) in fieldList">
      <!-- 动态组件实现表单组件 -->
      <el-form-item
        v-if="!hideHandler(item)"
        :label="`${item.label}${colon ? ':' : ''}`"
        :prop="item.prop"
        :key="index || item.prop || item.label || index"
        v-bind="item.itemFormAttrs"
        :required="requiredHandler(item, item?.required)"
        :style="getChildWidth(item)"
      >
        <!-- 自定义label -->
        <template #label v-if="item.labelRender">
          <RenderComp
            :createElementFunc="item.labelRender"
            :item="item"
          ></RenderComp>
        </template>
        <!-- 自定义输入框插槽 -->
        <template v-if="item.slot">
          <slot :name="item.slot"></slot>
        </template>
        <!-- 文本展示值(用于实现Descriptions 描述列表) -->
        <template v-if="item.textShow">
          <span>{{ item.textValue || formData[item.prop] }}</span>
        </template>
        <!-- elementui表单组件 -->
        <component
          v-if="item.type && !item.slot && !item.textShow"
          :is="item.type"
          v-model="formData[item.prop]"
          clearable
          filterable
          :placeholder="getPlaceholder(item)"
          :style="{ width: item?.attrs?.width || '100%' }"
          :disabled="disabledHandler(item, item?.attrs?.disabled)"
          v-bind="item.attrs"
          v-on="extendEvent(item)"
        >
          <template #prepend v-if="item.prepend">{{ item.prepend }}</template>
          <template #append v-if="item.append">{{ item.append }}</template>
          <template v-if="item.childSlotName">
            <slot :name="item.childSlotName"></slot>
          </template>
          <!-- 所有elementui的二级，暂不考虑其他 -->
          <template v-else-if="item.childAttrs?.options">
            <component
              v-for="(itemO, index) in getOptionsList(item)"
              :key="itemO[item.childAttrs?.value || 'value'] || index"
              :is="compChildName(item.type)"
              :disabled="itemO?.disabled"
              :value="itemO[item.childAttrs?.value || 'value']"
              :label="itemO[item.childAttrs?.label || 'label']"
              v-bind="item.childAttrs"
            >
              {{ itemO[item.childAttrs?.label || "label"] }}
            </component>
          </template>
        </component>
      </el-form-item>
    </template>
    <!-- 按钮 -->
    <el-form-item>
      <slot name="beforeAfterSlot"></slot>
      <slot name="btnSlot" :formData="formData" v-if="!$slots.btnSlot"></slot>
      <template v-else>
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button @click="onCancel">取消</el-button>
      </template>
      <slot name="btnAfterSlot"></slot>
    </el-form-item>
  </el-form>
</template>

<script>
import RenderComp from "./renderComp.vue";
import { Type } from "./type.js";
import { NameSpace } from "../../../utils/nameSpace.js";

// interface IChildAttrs {
//   options: any[] | string; //如果为string则取receiverMap中找
//   value: string;
//   label: string;
//   [attrName: string]: any; //二级的Attributes
// }

// elementui表单组件事件通过attrs中传递
// interface IAttrs {
//   disabled:Boolean | Function;
//   input?: Function;
//   focus?: Function;
//   clear?: Function;
//   blur?: Function;
//   change?: Function;
//   'visible-change'?: Function;
//   'remove-tag'?: Function;
//   'expand-change'?: Function;
//   'active-change'?: Function;
//   'left-check-change'?: Function;
//   'right-check-change'?: Function;
//   [attrName: string]: any;
// }

// Form-Item Attributes
// interface IItemFormAttrs {
//   required: Boolean | Function;
//   rules: object;
//   [attrName: string]: any;
// }

// 尽量用继承保证和elementui属性一致，减少使用难度（attrs, itemFormAttrs, childAttrs）
// interface IFieldList {
//   type: string; //有type是elementui组件
//   label: string;
//   labelRender?: (h: any, ctx: any) => vNode; //自定义label渲染函数
//   prop: string;
//   required: Boolean | Function;//是否启用校验
//   rules?: any[]; //校验规则
//   hide: boolean | Function; //是否隐藏该项
//   column: Number //一行显示个数(1就是独占一行)
//   slot?:string; //自定义输入框插槽
//   itemFormAttrs: IItemFormAttrs; //el-form-item的Attributes
//   attrs?: IAttrs; //所有表单组件的Attributes   包括事件
//   childAttrs?: IChildAttrs; //子组件的Attributes
// }

//  注意
//  1.不要在Function类型中使用过于复杂的影响性能的复杂逻辑

export default {
  components: { RenderComp },
  props: {
    //搜索框表单绑定的值
    formData: {
      type: Object,
      default: () => {},
    },
    //搜索框表单字段描述列表
    fieldList: {
      type: Array,
      default: () => [],
    },
    //是否有冒号(默认无)
    colon: {
      type: Boolean,
      default: false,
    },
    //下拉框等二级组件数据
    receiverMap: {
      type: Object,
      default: () => {},
    },
    labelWidth: {
      type: String,
      default: "100px",
    },
    //一行显示个数,如果没有则相当于inline:true
    column: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      ns: new NameSpace("mainForm"),
      formDataInit: {}, //初始化表单，用于重置表单用
      rules: {},
      colSize: this.column, //一行显示格式
    };
  },
  watch: {
    //校验规则 监听fieldList的item.rules变化，更新this.rules (表单页面一般不会很多，不考虑了性能)
    fieldList: {
      handler(val) {
        this.setRules(val);
      },
      immediate: true,
      deep: true,
    },
    column(val) {
      this.colSize = val;
    },
  },
  computed: {
    extendEvent() {
      return ({ attrs }) => {
        if (!attrs) return {};
        let event = { ...attrs };
        let changeEvent = {};
        Object.keys(event).forEach((v) => {
          changeEvent[v] = (e) => {
            // 判断event[v]是函数类型的
            if (event[v] && typeof event[v] === "function") {
              event[v](this.formData, e, arguments); //这里统一暴露formData。其他数据可以通过arguments[0]获取(VueComponent)
            }
          };
        });
        return { ...changeEvent };
      };
    },
  },
  mounted() {
    // 记录当前formData的初始状态，用于重置表单
    this.formDataInit = JSON.parse(JSON.stringify(this.formData));
  },
  methods: {
    // 二级组件名称
    compChildName(type) {
      switch (type) {
        case Type.SELECT:
          return "el-option";
        case Type.RADIOGROUP:
          return "el-radio";
        case Type.CHECKBOXGROUP:
          return "el-checkbox";
      }
    },

    //二级组件数组
    getOptionsList(item) {
      // 如果其为数组直接使用，如果是字符串则去this.receiverMap中去匹配
      const options = item.childAttrs?.options;
      if (!options) return [];
      if (Array.isArray(options)) {
        return options;
      } else {
        return this.receiverMap[options];
      }
    },

    getPlaceholder(item) {
      // 返回elementui组件的placeholder
      if (Object.keys(item?.attrs).includes("placeholder"))
        return item.attrs?.placeholder;
      // elementui显示请输入xxx的组件
      const placeholderInput = [Type.INPUT];
      const placeholderSelect = [Type.SELECT, Type.CASCADER];
      if (placeholderInput.includes(item.type)) {
        return "请输入" + item.label || "";
      } else if (placeholderSelect.includes(item.type)) {
        return "请选择" + item.label || "";
      } else if (Type.TIMESELECT === item.type) {
        return "选择时间";
      } else if (Type.TIMEPICKER === item.type) {
        return "选择时间";
      } else if (Type.DATEPICKER === item.type) {
        if (!item.attrs) return "选择时间";
        if (item.attrs.type === "week") return "选择周";
        if (item.attrs.type === "month") return "选择月";
        if (item.attrs.type === "year") return "选择年";
        if (item.attrs.type === "dates") return "选择一个或多个日期";
        if (item.attrs.type === "months") return "选择一个或多个月";
        if (item.attrs.type === "years") return "选择一个或多个年";
        if (item.attrs.type === "datetime") return "选择日期时间";
      }
    },

    //添加校验规则
    addRulesItem(key, rules, label) {
      // 如果有校验则覆盖
      this.rules[key] = rules || [
        {
          required: true,
          message: `${label || "当前内容"}不能为空`,
          trigger: ["blur", "change", "clear"],
        },
      ];
    },
    //移除校验规则
    removeRulesItemByKey(key) {
      Object.keys(this.rules).includes(key) && delete this.rules[key];
    },
    //设置生成校验规则
    setRules(fieldList) {
      this.rules = {};
      fieldList.forEach((item) => {
        //如果item?.required为true，则向this.rules中添加校验规则，如果为false则去rules查找是否有校验规则，有的话直接删除校验规则
        if (item?.required) {
          this.addRulesItem(item.prop, item?.rules, item.label);
        } else {
          this.removeRulesItemByKey(item.prop);
        }
      });
    },

    //hide是否显示该项(boolean | function)
    hideHandler(item) {
      if (!Object.keys(item).includes("hide")) return false;
      if (typeof item.hide === "function")
        return !!item.hide({ item, formData: this.formData });
      return !!item.hide;
    },
    // disabled处理(boolean | function)
    disabledHandler(item, disabled) {
      if (typeof disabled === "function")
        return !!disabled({ item, formData: this.formData });
      return !!disabled;
    },
    // required处理(boolean | function)
    requiredHandler(item, required) {
      let tempRequired = false;
      tempRequired =
        typeof required === "function"
          ? !!required({ item, formData: this.formData })
          : !!required;
      //副作用更新rules（保证rules中和required的一致性）
      tempRequired
        ? this.addRulesItem(item.prop, item?.rules)
        : this.removeRulesItemByKey(item.prop);
      return tempRequired;
    },

    // label与输入框的布局方式
    getChildWidth(item) {
      if (this.$attrs.labelPosition === "top") {
        return `flex: 0 1 calc((${
          100 / (item.column || this.colSize)
        }% - 10px));margin-right:10px;`;
      } else {
        return `flex: 0 1 ${100 / (item.column || this.colSize)}%;`;
      }
    },

    //表单校验
    validate() {
      console.log("保存数据", {
        formData: this.formData,
        rules: this.rules,
        fieldList: this.fieldList,
        receiverMap: this.receiverMap,
        formDataInit: this.formDataInit,
      });
      return new Promise((resolve, reject) => {
        this.$refs.formRef.validate((valid) => {
          console.log("4444444444", valid);
          if (valid) {
            resolve({
              valid,
              formData: this.formData,
            });
          } else {
            reject({
              valid,
              formData: this.formData,
            });
          }
        });
      });
    },
    onSubmit() {
      this.validate()
        .then((res) => {
          this.$emit("onSubmit", this.formData);
        })
        .catch((err) => {
          console.log("校验失败", err);
        });
    },
    onCancel() {
      // form表单的取消事件，并恢复this.formData数据到最初始状态
      Object.keys(this.formDataInit).forEach((key) => {
        this.formData[key] = this.formDataInit[key];
      });
      this.$refs.formRef.resetFields();
      this.$refs.formRef.clearValidate();
      this.$emit("onCancel");
    },
  },
};
</script>
<style lang="scss" scoped>
.dyt-mainForm {
  display: flex;
  flex-wrap: wrap;
}
</style>
