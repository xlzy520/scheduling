/**
 * element-ui各组件的方法重写
 */
import { Input, Checkbox, CheckboxGroup } from 'element-ui';

//重写input组件的方法，防止在ie下初始化或聚焦input时自动触发oninput方法，从而触发表单校验
export let ReInput = {
  extends: Input,
  methods: {
    handleInput(event) {
      const oldValue = event.target._value;
      const newValue = event.target.value;
      if (oldValue === newValue && newValue === '') {
        return;
      }
      // const value = event.target.value;
      this.setCurrentValue(newValue);
      if (this.isOnComposition) return;
      this.$emit('input', newValue);
    }
  }
};

//不触发表单校验的复选框
export let withoutFormCheckbox = {
  extends: {...Checkbox, watch: undefined},
};
//不触发表单校验的复选框组
export let withoutFormCheckboxGroup = {
  extends: {...CheckboxGroup, watch: undefined},
};

