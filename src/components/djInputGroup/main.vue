<script>
  export default {
    name: 'dj-input-group',
    props: {
      connector: {
        type: String,
        default: ''
      },
    },
    render() {
      return (
        <div class="dj-input-group">
          {
            this.$slots.default.map((vNode, index)=>{
              return [
                (
                  <div class="dj-input-group_item" key={index}>
                    {vNode}
                  </div>
                ),
                this.$slots.default.length !== index + 1 ? (<span class="dj-input-group_connector">{this.connector}</span>) : undefined
              ];
            })
          }
        </div>
      );
    }
  };
</script>
<style lang="less" scoped>
.dj-input-group {
  display: flex;
  align-items: center;
  .dj-input-group_item {
    flex: 1 1 auto;
  }
  .dj-input-group_connector {
    margin: 0 5px;
  }
}
</style>
