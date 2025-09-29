/* 
  基础类型：参数节点param、员工节点employee
  细分类型：首帧、尾帧、员工1、员工2、员工3等

  对应关系
    参数节点：首帧、尾帧等
    员工节点：员工1、员工2、员工3等

  接口字段类型：与细分类型相对应

  文件类型：用于区分渲染
    视频：video
    图片：image
    文本：text
    音频：audio
  
  表单字段类型
    文本输入框：input
    选择框：select
    ...等
*/


const data = {
  // 节点数组
  node: [
    {
      id: '1', // 节点唯一标识
      type: 'customeNode', // 画布渲染节点类型（前端自定义节点时类型区分）
      // 节点位置
      position: {
        x: 0,
        y: 0,
      },
      // 节点携带数据
      data: {
        time: '2021-02-14 8:00:00', // 节点创建时间，前端生成
        basicType: 'employee', // 基础类型
        type: 'employee1', // 细分类型
        name: '素材分析师', // 节点名称
        status: 'loading', // 员工节点时表示当前请求状态，区分状态生成中loading/生成完成complete；参数节点时标识节点状态，失败节点error
        workflowId: '', // 员工接地那专属字段：当前工作流id，用于执行工作流
        nodeId: '', // 员工节点专属字段: 对应工作流协议中的nodeId字段
        // 员工节点专属字段：存储下个员工节点参数，用于判断
        nextNode: {
          nodeId: '', 
          type: '',
          name: ''
        },
        // 员工节点专属字段：内部表单字段协议，用于节点内容渲染
        formField: [
          {
            name: 'field1', // 字段名称，对应工作流协议name字段
            label: '字段1', // 字段显示，对应工作流协议description字段
            type: 'input', // 字段类型
            require: true, // 字段必填
            value: '', // 字段值
            tip: '细化生成精度' // 字段提示词，预留字段
            /* ...其他字段 */
          },
          {
            name: 'field2', // 字段名称
            label: '字段2', // 字段显示
            type: 'video', // 字段类型
            require: true, // 字段必填
            value: '', // 字段值
            /* ...其他字段 */
          }
        ],
        // 通用字段：对应类型节点样式
        style: {
          width: 100, // 节点宽度
        },
        // 员工节点专属字段：用于外部输入节点检测
        inputParams: [
          {
            type: 'firstFrame', // 节点类型，对应工作流协议name字段
            name: '首帧', // 节点名称，对应工作流协议description字段
            /* ...其他字段 */
          }
        ],
        // 员工节点专属字段：用于外部输出节点检测
        outputParams: [
          {
            type: 'firstFrame', // 节点类型
            /* ...其他字段 */
          }
        ],
        // 参数节点专属字段：内容协议，用于区分渲染节点内容
        content: [
          {
            type: 'video', // 文件类型
            value: 'https://insight-gpt.oss-cn-shenzhen.aliyuncs.com/assets/video/index.mp4', // 文件链接/文本内容
            isSelected: false // 预留字段用于后续选中处理
          }
        ],
        // 参数节点专属字段：存储完整输出的结果
        outputData: {
          video_url: ['', '']
        }
      }
    }
  ],
  // 连线数组
  edge: [
    {
      id: '1', // 连线唯一标识
      source: '1', // 连线源节点id标识
      target: '2', // 连线目标节点id标识
    }
  ]
}