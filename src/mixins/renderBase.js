/**
 * 为使用render函数渲染的vue组件提供通用方法
 */
import { methods } from '@/utils';
const { stopPropagation, preventDefault } = methods;
export default {
  methods: {
    emit(event, eventName, param, disabled) {
      !disabled && this.$emit('on-event', {eventName, param});
    },
    emit_stop(event, eventName, param, disabled) {
      stopPropagation(event);
      this.emit(event, eventName, param, disabled);
    },
    emit_prevent(event, eventName, param, disabled) {
      preventDefault(event);
      this.emit(event, eventName, param, disabled);
    }
  }
};
