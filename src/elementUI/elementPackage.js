/**
 * element-ui各组件的方法重写
 */
import { Input } from 'element-ui';

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
