import ELEMENT from 'element-ui';
ELEMENT.Button.methods.handleClick = function(e) {
  !this.disabled && this.$emit('click', e);
};
export default ELEMENT;
