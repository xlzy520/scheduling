<template>
    <dj-dialog ref="dialog" @close="close" width="700px" title="选择责任部门/责任人" @confirm="confirm">
      <el-tree @node-click="handleNodeClick"
               :props="props"
               :load="remote"
               lazy></el-tree>
      <div slot="footer"></div>
    </dj-dialog>
</template>
<script>
  import paperWarehouseService from '../../../api/service/paperWarehouse';

  export default {
    name: 'selectUsePerson',
    data: function () {
      return {
        // data: [],
        props: {
          label: 'label',
          // children: 'zones',
          isLeaf: 'isLeaf'
        },
      };
    },
    created() {
    },
    methods: {
      loadNode(node, resolve) {
        if (node.level === 0) {
          return resolve([{ name: 'region' }]);
        }
        if (node.level > 1) return resolve([]);

        setTimeout(() => {
          const data = [{
            name: 'leaf',
            leaf: true
          }, {
            name: 'zone'
          }];

          resolve(data);
        }, 500);
      },
      getDepartment() {
        return this.dj_api_extend(paperWarehouseService.getDepartment).then(arr=>{
          // this.department_arr = arr;
          arr.map(obj=>{
            obj['isLeaf'] = false;
          });
          return arr;
        });
      },
      getRole(val) {
        return this.dj_api_extend(paperWarehouseService.getRole, {id:val}).then(arr=>{
          arr.map(obj=>{
            obj['isLeaf'] = false;
          });
          return arr;
        });
      },
      getMember(val) {
        return this.dj_api_extend(paperWarehouseService.getMember, {id:val}).then(arr=>{
          // this.member_arr = arr;
          arr.map(obj=>{
            obj['isLeaf'] = true;
          });
          return arr;
        });
      },
      remote(node, resolve) {
        let { level, data } = node;
        if (level === 0) {
          this.getDepartment().then(resolve);
        } else if (level === 1) {
          this.getRole(data.value).then(resolve);
        } else if (level === 2) {
          this.getMember(data.value).then(resolve);
        }
      },
      confirm() {
      },
      open(param) {
        this.$refs.dialog.open();
      },
      close() {
        this.$refs.dialog.close();
        this.$emit('close');
      },
      handleNodeClick(data, node) {
        if (data.isLeaf) {
          let root = node;
          while (root.level > 1) {
            root = root.parent;
          }
          this.$emit('selectPerson', [root.data, data]);
          this.close();
        }
      }
    }
  };
</script>
