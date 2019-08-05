<template>
  <div class="table-page rule-customize">
    <dj-table
      :data="tableData"
      :columns="tableColumns"
      :total="pageTotal"
      v-loading="tableLoading"
    >
      <div slot="btn">
        <el-button type="primary" @click="headerBtnAdd('stack')">新增叠单规则</el-button>
        <el-button type="primary" @click="headerBtnAdd('pack')">新增打包规则</el-button>
        <!--<el-button type="primary" @click="closeSuoBian">关闭缩边</el-button>-->
      </div>
    </dj-table>
    <dj-dialog v-if="dialogType==='stack'" ref="dialog" @close="close" @confirm="stackConfirm"
               :title="dialogTypeIsAdd?'新增叠单规则': '编辑叠单规则'">
      <div class="rule-customize-dialog">
        <dj-form ref="stackForm" :form-data="stackFormData" :form-options="stackFormOptions" :column-num="2" />
        <div v-for="(condition, index) in stackConditionFormData" class="condition-item stack">
          <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
          <div class="child-condition-list">
            <el-form :model="child" :rules="stackRules" ref="childConditionForm" v-for="(child, childIndex) in condition" class="dj-form">
              <el-row>
                <el-col :span="7" v-if="childIndex===0">
                  <el-form-item label="楞型" prop="tilemodel">
                    <dj-select v-model="child.tilemodel" :options="lengxingOptions"></dj-select>
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item label="切数" prop="cut">
                    <dj-select type="multiple" collapse-tags v-model="child.cut"
                               @change="qieshuChange"
                               :options="qieshuOptions"></dj-select>
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item label="片数：" prop="piece">
                    <dj-input v-model="child.piece" class="piece"></dj-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3" class="button-col">
                  <i class="el-icon-delete" @click.prevent="removeCondition(index,childIndex)"></i>
                  <i class="el-icon-circle-plus" @click="addChildCondition(index, childIndex)"
                     v-if="childIndex===condition.length - 1"></i>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </div>
        <el-button type="primary" @click.prevent="addCondition">添加条件</el-button>
      </div>
    </dj-dialog>
    <dj-dialog v-if="dialogType==='pack'" ref="dialog" @close="close" @confirm="packConfirm"
               :title="dialogTypeIsAdd?'新增打包规则': '编辑打包规则'">
      <div class="rule-customize-dialog">
        <dj-form ref="packForm" :form-data="packFormData" :form-options="packFormOptions"
                 :column-num="zqjColumnNum" :col-rule="()=>zqjColRule"></dj-form>
        <div v-for="(condition, index) in packConditionFormData" :key="condition.key" class="condition-item">
          <span class="condition-index-label el-form-item__label">条件{{index+1}}</span>
          <div class="child-condition-list">
            <el-form :model="child" :rules="packRules" ref="childConditionForm" v-for="(child, childIndex) in condition" class="pack-form">
              <div class="rule-row">
                <el-form-item label="层数" prop="layer" v-if="childIndex===0" class="layer">
                  <dj-select v-model="child.layer" :options="layerOptions"></dj-select>
                </el-form-item>
                <el-form-item label="单位面积" class="unit-area">
                  <dj-input  type="float" v-model.number="child.startUnitarea" placeholder="请输入"
                             suffix-icon="m²"></dj-input>
                  <div style="margin: 0 5px">至</div>
                  <dj-input v-model.number="child.endUnitarea" placeholder="请输入" suffix-icon="m²"></dj-input>
                </el-form-item>
                <el-form-item label="打包数量" prop="packpiece" class="packpiece">
                  <el-input v-model="child.packpiece"></el-input>
                </el-form-item>
                <div class="button-col">
                  <i class="el-icon-delete" v-if="childIndex===condition.length - 1"
                     @click.prevent="removeCondition(index,childIndex)"></i>
                  <i class="el-icon-circle-plus" @click="addChildCondition(index, childIndex)"
                     v-if="childIndex===condition.length - 1"></i>
                </div>
              </div>
            </el-form>
          </div>
        </div>
        <el-button type="primary" @click.prevent="addCondition">添加条件</el-button>
      </div>
    </dj-dialog>
    <dj-dialog v-if="dialogType.includes('view')" ref="dialog" @close="close"
               :title="dialogType==='stack_view'?'查看叠单规则': '查看打包规则'">
      <div class="rule-customize-dialog-view" v-loading="viewLoading">
        <dj-grid-box :data="dialogType==='stack_view'?stackDetail: packDetail" :column-num="2" :col-rule="()=>12" class="rule-view-header">
          <template slot-scope="{item}">
            <div class="rule-view-header-label">{{item.label}}： {{viewData[item.prop]}}</div>
          </template>
        </dj-grid-box>
        <div class="rule-view-content">
          <dj-table
            border
            :data="viewData.detailModels||viewData.packRuleDetails"
            :columns="viewTableColumns"
            :span-method="objectSpanMethod"
            :is-need-page="false"
          ></dj-table>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="close">关闭查看</el-button>
      </div>
    </dj-dialog>
  </div>
</template>

<script>
  import ruleCustomizeService from '../../../api/service/ruleCustomize';
  import productionLineService from '../../../api/service/productionLine';
  import {djForm} from 'djweb';
  const layerOptions = [
    {label: '二层', value: '2'},
    {label: '三层', value: '3'},
    {label: '四层', value: '4'},
    {label: '五层', value: '5'},
    {label: '六层', value: '6'},
    {label: '七层', value: '7'},
  ];
  const qieshuOptions = [
    {label: '1', value: '1', disabled: true},
    {label: '2', value: '2'},
    {label: '3', value: '3'},
    {label: '4', value: '4'},
    {label: '5', value: '5'},
    {label: '6', value: '6'},
    {label: '7', value: '7'},
  ];

  export default {
    name: 'ruleCustomize',
    data() {
      return {
        dialogType: '',
        dialogTypeIsAdd: false,
        viewTableColumns: [],
        viewData: {},
        viewLoading: false,
        tableLoading: false,

        tableData: [],
        tableColumns: [
          {label: '名称', prop: 'name'},
          {label: '规则类型', prop: 'typeName'},
          {label: '生效时间', prop: 'effectiveTime'},
          {label: '操作人', prop: 'operator'},
          {label: '操作时间', prop: 'updateTime'},
          {label: '启用状态', prop: 'isEffected',
            render: (h, {props: {row}}) => {
              return (
                <div class={row.isEffected ? '' : 'rule-status-off'}>
                  {row.isEffected ? '已启用' : '已失效'}
                </div>
              );
            }
          },
          {
            label: '操作', prop: 'operation',
            render: (h, {props: {row}}) => {
              return (
                <div class="operation">
                  <a onClick={() => this.view(row)}>查看</a>
                  <a onClick={() => this.changeStatus(row)}>{row.isEffected ? '禁用' : '启用'}</a>
                  <a onClick={() => this.edit(row)}>编辑</a>
                </div>
              );
            },
          },
        ],

        stackFormData: {
          name: '222',
          produceLineId: '1',
          maxOrderCut: '222',
          maxStackHeight: '222',
          maxStackCount: '222',
        },
        stackFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '规则名称',
              rules: [
                djForm.rules.required('规则名称不能为空'),
                {pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/g, message: '只可输入汉字、字母、数字'},
              ],
            },
            attrs: {
              maxLength: 40,
            }
          },
          {
            type: 'select',
            formItem: {
              prop: 'produceLineId',
              label: '生产线',
              rules: [djForm.rules.required('请选择相应的生产线')],
            },
            attrs: {
              options: [],
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxOrderCut',
              label: '订单最大片数',
              rules: [
                djForm.rules.required('订单最大片数不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxStackHeight',
              label: '订单最小米数',
              rules: [
                djForm.rules.required('订单最小米数不能为空'),
                {type: 'number', message: '只可输入数字'},
                {type: 'number', max: 9999, message: '不能超过9999'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'maxStackCount',
              label: '最大堆叠单数',
              rules: [
                djForm.rules.required('最大堆叠单数不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              maxLength: 10,
              type: 'number'
            }
          },
        ],
        stackConditionFormData: [
          [
            {
              tilemodel: '',
              cut: '',
              piece: ''
            }
          ]
        ],
        stackRules: {
          tilemodel: [
            {required: true, message: '请选择楞型', trigger: 'change'}
          ],
          cut: [
            {required: true, message: '请选择切数', trigger: 'change'}
          ],
          piece: [
            {required: true, message: '请填写片数', trigger: 'change'}
          ]
        },

        packFormData: {
          name: '11',
          eachPackWeight: 222,
          aTilemodelRate: 44,
          bTilemodelRate: '44',
          cTilemodelRate: '44',
          eTilemodelRate: '44',
          fTilemodelRate: '44',
        },
        packFormOptions: [
          {
            type: 'input',
            formItem: {
              prop: 'name',
              label: '规则名称',
              rules: [
                djForm.rules.required('规则名称不能为空'),
                {pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/g, message: '只可输入汉字、字母、数字'},
              ],
            },
            attrs: {
              maxLength: 40,
            }
          },
          {
            type: 'input',
            formItem: {
              prop: 'eachPackWeight',
              label: '单批打包重量',
              rules: [
                djForm.rules.required('单批打包重量不能为空'),
                {type: 'number', message: '只可输入数字'},
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
              suffixIcon: "Kg"
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'aTilemodelRate',
              label: 'A楞型楞率',
              rules: [
                djForm.rules.required('A楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'bTilemodelRate',
              label: 'B楞型楞率',
              rules: [
                djForm.rules.required('B楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'cTilemodelRate',
              label: 'C楞型楞率',
              rules: [
                djForm.rules.required('C楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'eTilemodelRate',
              label: 'E楞型楞率',
              rules: [
                djForm.rules.required('E楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          },
          {
            type: 'input',
            formItem: {
              prop: 'fTilemodelRate',
              label: 'F楞型楞率',
              rules: [
                djForm.rules.required('F楞型楞率不能为空'),
                {type: 'number', message: '只可输入数字', trigger: 'change'}
              ],
            },
            attrs: {
              type: 'number',
              maxLength: 20,
            },
          }
        ],
        packConditionFormData: [
          [
            {
              layer: '3',
              startUnitarea: '0',
              endUnitarea: '4',
              packpiece: '6',
            }
          ]
        ],
        packRules: {
          layer: [
            {required: true, message: '请选择层数', trigger: 'change'}
          ],
          area: [
            {required: true, message: '请完成单位面积', trigger: 'change'}
          ],
          packpiece: [
            {required: true, message: '请填写打包数量', trigger: 'change'}
          ]
        },

        lengxingOptions: this.$enum.fluteType,
        qieshuOptions: qieshuOptions,
        layerOptions: layerOptions,
        rules: {
          tilemodel: [
            {required: true, message: '请选择楞型', trigger: 'change'}
          ],
          cut: [
            {required: true, message: '请选择切数', trigger: 'change'}
          ],
          piece: [
            {required: true, message: '请填写片数', trigger: 'change'}
          ]
        },
        stackDetail: [
          {prop: 'produceLineName', label: '生产线'},
          {prop: 'maxOrderCut', label: '订单最大片数'},
          {prop: 'maxStackHeight', label: '最小订单刀数'},
          {prop: 'maxStackCount', label: '最大堆叠单数'},
        ],
        packDetail: [
          {prop: 'eachPackWeight', label: '单批打包重量(Kg)'},
          {prop: 'aTilemodelRate', label: 'A楞型楞率'},
          {prop: 'bTilemodelRate', label: 'B楞型楞率'},
          {prop: 'cTilemodelRate', label: 'C楞型楞率'},
          {prop: 'eTilemodelRate', label: 'E楞型楞率'},
          {prop: 'fTilemodelRate', label: 'F楞型楞率'},
        ],

        zqjColumnNum: '',
        zqjColRule: '',
        pageOptions: {
          pageNo: 1,
          pageSize: 20,
        },
        pageTotal: 0,
      };
    },
    methods: {
      qieshuChange(arr) {

      },
      zqjGetColumnNum() {
        const width = window.innerWidth;
        this.zqjColumnNum = width < 1400 ? 3 : 4;
      },
      zqjGetColRule() {
        const width = window.innerWidth;
        this.zqjColRule = width < 1400 ? 8 : 6;
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          if (rowIndex % 2 === 0) {
            return {
              rowspan: 2,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },
      addChildCondition(index, childIndex) {
        if (this.dialogType === 'stack') {
          if (this.dialogTypeIsAdd) {
            this.stackConditionFormData[index].push({
              tilemodel: this.stackConditionFormData[index][0].tilemodel,
              cut: '',
              piece: '',
            });
          } else {
            this.stackConditionFormData[index].push({
              tilemodel: this.stackConditionFormData[index][0].tilemodel,
              cut: '',
              piece: '',
            });
          }

        } else {
          if (this.dialogTypeIsAdd) {
            this.packConditionFormData[index].push({
              layer: this.packConditionFormData[index][0].layer,
              startUnitarea: '',
              endUnitarea: '',
              packpiece: ''
            });
          } else {
            this.packConditionFormData[index].push({
              layer: this.packConditionFormData[index][0].layer,
              startUnitarea: this.packConditionFormData[index][childIndex].endUnitarea,
              endUnitarea: '',
              packpiece: ''
            });
          }

        }
      },
      headerBtnAdd(dialogType) {
        this.dialogTypeIsAdd = true;
        this.dialogType = dialogType;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
      },
      addCondition() {
        if (this.dialogType === 'stack') {
          this.stackConditionFormData.push(
            [{
              tilemodel: '',
              cut: '',
              piece: '',
            }]);
        } else {
          this.packConditionFormData.push(
            [{
              layer: '',
              startUnitarea: 0,
              endUnitarea: '',
              packpiece: '',
            }]);
        }
      },
      removeCondition(index, childIndex) {
        // todo 增加删除动画
        const targetArr = this[this.dialogType + 'ConditionFormData'];
        if (targetArr.length === 1) {
          return false;
        }
        if (targetArr[index].length === 1) {
          targetArr.splice(index, 1);
        } else {
          targetArr[index].splice(childIndex, 1);
        }
      },
      changeRuleEffectedApi({isEffected, id}) {
        ruleCustomizeService.changeEffected({
          effected: Math.pow(0, isEffected), // 0、1数字取反
          ruleId: id
        }).then(() => {
          this.$message(isEffected ? '禁用成功' : '启用成功', 'success');
          this.search();
        });
      },
      changeStatus(row) {
        if (!row.isEffected) {
          this.$confirm('确定启用该条内容吗？', '', {
            type: 'warning',
            showClose: false,
          }).then(() => {
            this.changeRuleEffectedApi(row);
          });
        } else {
          this.changeRuleEffectedApi(row);
        }
      },
      view(row) {
        this.viewLoading = true;
        let stack = [
          {label: '楞型', prop: 'tilemodel'},
          {label: '切数', prop: 'cut'},
          {label: '片数', prop: 'piece'},
        ];
        let pack = [
            {label: '层数', prop: 'layer'},
            {label: '单位面积（m²）', prop: 'endUnitarea', formatter: row=> row.startUnitarea + '-' + row.endUnitarea},
            {label: '打包数量', prop: 'packpiece'},
          ];
        this.dialogType = (row.typeName === '叠单规则' ? 'stack' : 'pack') + '_view';
        this.viewTableColumns = row.typeName === '叠单规则' ? stack : pack;
        this.$nextTick(()=>{
          this.$refs.dialog.open();
        });
        ruleCustomizeService.getRuleDetail({
          ruleId: row.id
        }).then(res=>{
          this.viewData = res;
        }).finally(()=>{
          this.viewLoading = false;
        });
      },
      edit(row) {
        this.dialogType = row.typeName === '叠单规则' ? 'stack' : 'pack';
        this.dialogTypeIsAdd = false;
        ruleCustomizeService.getRuleDetail({
          ruleId: row.id
        }).then(res=>{
          if (this.dialogType === 'stack') {
            let { detailModels, ...rest } = res;
            this.stackFormData = rest;
            let cache = [[], [], [], [], [], [], []];
            for (let i = 0; i < detailModels.length; i++) {
              detailModels[i].cut = [detailModels[i].cut ]
              cache[detailModels[i].cut - 1].push(detailModels[i]);
            }
            this.stackConditionFormData = cache;
          } else {
            let { packRuleDetails, ...rest } = res;
            this.packFormData = rest;
            let cache = [[], [], [], [], [], []];
            for (let i = 0; i < packRuleDetails.length; i++) {
              cache[packRuleDetails[i].layer - 2].push(packRuleDetails[i]);
            }
            this.packConditionFormData = cache;
          }
          this.$nextTick(()=>{
            this.$refs.dialog.open();
          });
        });
      },
      closeSuoBian() {
        this.$confirm('确定关闭缩边吗？', '', {
          type: 'warning',
          showClose: false,
        }).then(() => {
          ruleCustomizeService.list().then((res) => {
            this.$message('关闭成功', 'success');
          });
        });
      },
      search(data) {
        this.getTableData(data);
      },
      stackConfirm() {
        const formValidate = new Promise((resolve) => {
          let allIsTrue = [];
          this.$refs.stackForm.validate((valid) => {
            if (valid) {
              allIsTrue.push(true);
            }
          });
          this.$refs['childConditionForm'].map((child, index)=>{
            child.validate((valid) => {
              if (valid) {
                allIsTrue.push(true);
              }
              if (index === this.$refs['childConditionForm'].length - 1) {
                resolve(allIsTrue);
              }
            });
          });
        });
        formValidate.then(res=>{
          if (res.length === this.$refs['childConditionForm'].length + 1) {
            const detailModels = this.stackConditionFormData.reduce((pre, cur)=>{
              let cache = cur.map(v=>{
                return v.cut.map(vcut=>{
                  return {
                    tilemodel: v.tilemodel,
                    cut: vcut,
                    piece: v.piece,
                  };
                });
              });
              return pre.concat(...cache);
            }, []);
            const packRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addStackRule : ruleCustomizeService.modifyStackRule;
            packRequest({
              ...this.stackFormData,
              detailModels: detailModels
            }).then((res) => {
              this.close();
              const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
              this.$message(message, 'success');
            });
          }
        });
      },
      packConfirm() {
        const formValidate = new Promise((resolve) => {
          let allIsTrue = [];
          this.$refs.packForm.validate((valid) => {
            if (valid) {
              allIsTrue.push(true);
            }
          });
          this.$refs['childConditionForm'].map((child, index)=>{
            child.validate((valid) => {
              if (valid) {
                allIsTrue.push(true);
              }
              if (index === this.$refs['childConditionForm'].length - 1) {
                resolve(allIsTrue);
              }
            });
          });
        });
        formValidate.then(res=>{
          if (res.length === this.$refs['childConditionForm'].length + 1) {
            const packRuleDetails = this.packConditionFormData.reduce((pre, cur)=>{
              return pre.concat(...cur);
            }, []);
            const packRequest = this.dialogTypeIsAdd ? ruleCustomizeService.addPackRule : ruleCustomizeService.modifyPackRule;
            packRequest({
              ...this.packFormData,
              packRuleDetails: packRuleDetails
            }).then((res) => {
              this.close();
              const message = this.dialogTypeIsAdd ? '新增成功' : '编辑成功';
              this.$message(message, 'success');
            });
          }
        });
      },
      close() {
        if (this.dialogType === 'stack') {
          this.stackFormData = {
            name: '',
            produceLineId: '',
            maxOrderCut: '',
            maxStackHeight: '',
            maxStackCount: '',
          };
          this.stackConditionFormData = [
            [
              {
                tilemodel: '',
                cut: '',
                piece: ''
              }
            ]
          ];
        } else {
          this.packFormData = {
            name: '',
            eachPackWeight: '',
            aTilemodelRate: '',
            bTilemodelRate: '',
            cTilemodelRate: '',
            eTilemodelRate: '',
            fTilemodelRate: '',
          };
          this.packConditionFormData = [
            [
              {
                layer: '',
                startUnitarea: '',
                endUnitarea: '',
                packpiece: '',
              }
            ]
          ];
        }
        this.dialogType = '';
      },
      getTableData(data) {
        this.tableLoading = true;
        ruleCustomizeService.list({
          ...data,
          ...this.pageOptions
        }).then((res) => {
          this.tableData = res.list;
          this.pageTotal = res.total;
        }).finally(()=>{
          this.tableLoading = false;
        });
      },
    },
    created() {
      this.getTableData();
      ruleCustomizeService.getAllLine().then(res=>{
        const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        const lineOptions = res.list.map(v=>{
          return {
            label: chnNumChar[v.lineNum] + '号线',
            value: v.id
          };
        });
        this.$set(this.stackFormOptions[1].attrs, 'options', lineOptions);
      });
      this.zqjGetColRule();
      this.zqjGetColumnNum();
      window.addEventListener('resize', ()=>{
        this.zqjGetColRule();
        this.zqjGetColumnNum();
      });
    },
  };
</script>

<style lang="less" scoped>
  @deep: ~'>>>';
  @{deep} .operation {
    line-height: 1;
    a {
      padding: 2px 10px;
      cursor: pointer;
      &:not(:last-child){
        border-right: 1px solid #f0f2f5;
      }
    }
  }
  @{deep} .rule-status-off{
    color: #afb1b5;
  }
  .rule-customize-dialog-view{
    width: 40vw;
    .rule-view-header{
      padding: 0 10px;
      color: #000;
      font-weight: bold;
      &-label{
        padding: 5px 20px;
        padding-left: 0;
      }
      &.stack{
        display: flex;
        justify-content: space-between;
      }
    }
    .rule-view-content{
      box-sizing: border-box;
      padding-right: 20px;
    }
  }

  .rule-customize-dialog {
    width: 80vw;
    .condition-item{
      display: flex;
      .rule-row{
        display: flex;
        justify-content: flex-end;
        width: 80%;
        @{deep} .el-form-item{
          width: 352px;
          .el-input, .el-select{
            width: 236px;
          }
        }
        .packpiece{
          margin-left: 36px;
        }
      }
      .el-row{
        display: flex;
        justify-content: flex-end;
      }
      .condition-index-label{
        text-align: right;
        width: 60px;
        margin-right: 16px;
      }
      &.stack{
        .condition-index-label{
          line-height: 43px;
        }
      }
      .button-col{
        width: 50px;
        display: flex;
        margin-top: 8px;
        i.el-icon-delete,i.el-icon-circle-plus{
          font-size: 18px;
          cursor: pointer;
        }
        i.el-icon-delete{
          margin: 0 10px;
        }
        i.el-icon-circle-plus{
          color: #3554ea;
        }
      }
      .child-condition-list{
        width: 100%;
        @{deep} .piece{
          .dj-input-content{
            width: auto;
          }
        }
        @media screen and (max-width: 1367px) {
          @{deep} .dj-form .dj-input-content, .dj-form .el-cascader, .dj-form .el-date-editor.el-input, .dj-form .el-select{
            width: auto;
          }
        }
      }
      @media screen and (max-width: 1367px) {
        .child-condition-list{
          width: 94%;
        }
        .rule-row{
          width: 100%;
        }
      }
      @{deep} .dj-input-content{
        .el-input{
          width: 200px;
        }
      }
      .pack-form{
        @media screen and (max-width: 1367px) {
          @{deep} .dj-input-content{
            .el-input{
              width: 160px;
            }
          }
        }
        .condition-index-label{
          text-align: right;
          width: 60px;
          line-height: unset;
          margin-right: 16px;
        }
      }
      @{deep} .unit-area{
        .el-form-item__content{
          display: flex;
          .el-input{
            width: 106px;
          }
          @media screen and (max-width: 1367px) {
            .el-input{
              width: 90px;
            }
          }
        }
      }
    }

  }
  @{deep} .m²::before{
    content: "m²";
    width: 5px;
    height: 5px;
  }
  @{deep} .Kg::before{
    content: "Kg";
    width: 5px;
    height: 5px;
  }
</style>
