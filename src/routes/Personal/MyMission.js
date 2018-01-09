// import React, {Component} from 'react'
// import {
//     Button,
//     Radio,
//     Table,
//     Progress,
//     Divider,
//     Select,
//     Input,
//     Popover,
//     Avatar,
//     Card,
//     message
// } from 'antd'
// import {
//     Link,
//     Route,
//     Switch,
//     Redirect
// } from 'react-router-dom'

// // 引入工具方法
// import {isObject, isArray, valueToMoment, momentToValue, resetObject} from 'UTILS/utils'
// import {ajax, index, store, show, update, destroy} from 'UTILS/ajax'

// import BasicOperation from 'COMPONENTS/basic/BasicOperation'

// // 自定义弹窗
// import CustomPrompt from 'COMPONENTS/modal/CustomPrompt'
// import CustomRangePicker from 'COMPONENTS/date/CustomRangePicker'
// import CustomDatePicker from 'COMPONENTS/date/CustomDatePicker'
// import CustomModal from 'COMPONENTS/modal/CustomModal'

// import withBasicDataModel from 'COMPONENTS/hoc/withBasicDataModel'

// const {TextArea} = Input
// const {Option} = Select

// class MyMission extends Component {
//     state = {
//         // 默认显示全部任务
//         status: 'all',
//         myTask: {
//             wait: 0,
//             doing: 0,
//             done: 0
//         }
//     }

//     componentDidMount() {
//         let page = this.props.location.state ? this.props.location.state.page : 1
//         this.props.getData(
//             {page: page},
//             (params) => ajax('get', `/task/${this.props.user.id}/all`, params)
//         )
//         this.getMyTaskStatus()
//     }

//     getMyTaskStatus = () => {
//         ajax('get', `/task/${this.props.user.id}/personal-status`)
//             .then(res => {
//                 this.setState({
//                     myTask: {
//                         ...res.data
//                     }
//                 })
//             })
//     }

//     handleStatusChange = (e) => {
//         let val = e.target.value
//         this.setState({
//             status: val
//         })
//         let data = {
//             page: 1,
//         }
//         if (val !== 'all') {
//             data['status'] = val
//         }
//         this.props.getData(
//             data,
//             (params) => ajax('get', `/task/${this.props.user.id}/all`, params)
//         )
//     }

//     handleTaskStatus = (e) => {
//         let tid = e.target.dataset['tid']
//         let status = e.target.dataset['status']
//         CustomPrompt({
//             type: 'confirm',
//             content: <div>{`是否${status === '1' ? '开始任务' : '完成任务'}`}</div>,
//             okType: 'info',
//             onOk: () => {
//                 this.props.handleSetState('isSubmitting', true)
//                 ajax('put', `/task/${tid}/user/${this.props.user.id}/status`, {status: status})
//                     .then(res => {
//                         if (res.data.errors) {
//                             message.error(res.data.errors.message)
//                         } else {
//                             let dataSource = []
//                             this.props.dataSetting.dataSource.forEach(ds => {
//                                 if (ds.id === res.data.id) {
//                                     dataSource.push(res.data)
//                                 } else {
//                                     dataSource.push(ds)
//                                 }
//                             })
//                             this.props.handleSetState('dataSetting', {
//                                 ...this.props.dataSetting,
//                                 dataSource: dataSource
//                             })
//                             this.props.handleSetState('isSubmitting', false)
//                             message.success('保存成功')
//                             this.getMyTaskStatus()
//                         }
//                     })
//                     .catch(err => {
//                         console.log(err)
//                         this.props.handleSetState('isSubmitting', false)
//                         message.error('保存失败')
//                     })
//             }
//         })
//     }

//     render() {
//         const {
//             route,
//             history,
//             location,
//             match
//         } = this.props
//         const state = this.state

//         const operationBtn = [
//             () => (
//                 <Radio.Group className="pull-right" value={state.status} onChange={this.handleStatusChange}>
//                     <Radio.Button value="all">全部</Radio.Button>
//                     <Radio.Button value="0">等待中</Radio.Button>
//                     <Radio.Button value="1">进行中</Radio.Button>
//                     <Radio.Button value="2">已完成</Radio.Button>
//                 </Radio.Group>
//             )
//         ]
//         const columns = [
//             {
//                 title: '任务内容',
//                 dataIndex: 'content',
//                 key: 'content',
//                 render: (text) => (
//                     <Popover content={text}>
//                         <div className="ellipsis" style={{width: 70}}>{text}</div>
//                     </Popover>
//                 )
//             },
//             // {
//             //     title: '所属项目',
//             //     dataIndex: 'project',
//             //     key: 'project',
//             //     render: (text, record) => (
//             //         <span>{text}</span>
//             //     )
//             // },
//             {
//                 title: '状态',
//                 dataIndex: 'status',
//                 key: 'status',
//                 render: (text) => {
//                     let status = {
//                         '0': '等待中',
//                         '1': '进行中',
//                         '2': '已完成'
//                     }
//                     return <span>{status[text]}</span>
//                 }
//             },
//             {
//                 title: '任务计划开始时间',
//                 dataIndex: 'plan_start_date',
//                 key: 'plan_start_date',
//             },
//             {
//                 title: '任务计划结束时间',
//                 dataIndex: 'plan_end_date',
//                 key: 'plan_end_date'
//             },
//             {
//                 title: '实际开始时间',
//                 dataIndex: 'start_date',
//                 key: 'start_date',
//                 render: (text, record) => (
//                     <span>{record['Users'][0]['start_date']}</span>
//                 )
//             },
//             {
//                 title: '实际结束时间',
//                 dataIndex: 'end_date',
//                 key: 'end_date',
//                 render: (text, record) => (
//                     <span>{record['Users'][0]['end_date']}</span>
//                 )
//             },
//             {
//                 title: '操作',
//                 key: 'action',
//                 render: (text, record) => {
//                     if (record['child'] && record['child'].length > 0) {
//                         return '点击左侧查看子任务'
//                     }
//                     let status = record['Users'][0]['status']
//                     const Start = () => <Button type="primary" loading={this.props.isSubmitting} data-tid={record.id} data-status="1" onClick={this.handleTaskStatus}>开始任务</Button>
//                     const Waiting = () => <Button type="primary" loading={this.props.isSubmitting} data-tid={record.id} data-status="2" onClick={this.handleTaskStatus}>完成任务</Button>
//                     return (
//                         <span>
//                             {
//                                 status === '0'
//                                 ? (<Start />)
//                                 : status === '1'
//                                 ? (<Waiting />)
//                                 : '已完成'
//                             }
//                         </span>
//                     )
//                 }
//             }
//         ]

//         const expandedRowRender = (record, text) => {
//             if (record.child) {
//                 return (
//                     <Table
//                         columns={columns}
//                         dataSource={record.child}
//                         rowKey={record => record.id}
//                         pagination={false}
//                     />
//                 )
//             } else {
//                 return null
//             }
//         }

//         return (
//             <div>
//                 <Card bordered={false}>
//                     <Card.Grid>
//                         待办任务
//                         <span className="pull-right">{state.myTask.wait}</span>
//                     </Card.Grid>
//                     <Card.Grid>
//                         正在进行任务
//                         <span className="pull-right">{state.myTask.doing}</span>
//                     </Card.Grid>
//                     <Card.Grid>
//                         已完成任务
//                         <span className="pull-right">{state.myTask.done}</span>
//                     </Card.Grid>
//                 </Card>
//                 <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
//                     <BasicOperation className="mb-10 clearfix" operationBtns={operationBtn} />
//                     <Table {...this.props.dataSetting} rowKey={record => record.id} columns={columns} expandedRowRender={expandedRowRender} />
//                 </div>
//             </div>
//         )
//     }
// }

// const MM = withBasicDataModel(MyMission, {
//     model: 'task',
//     title: '任务管理',
//     customGetData: true,
// })

// export default MM
import React from 'react'
import {
    Tabs,
    Card
} from 'antd'

import {ajax} from 'UTILS/ajax'

import PersonalTask from 'COMPONENTS/page/PersonalTask'

const TabPane = Tabs.TabPane

const HasProjectPersonalTask = PersonalTask({
    hasProject: true
})

const NoProjectPersonalTask = PersonalTask({
    hasProject: false
})

class MyMission extends React.Component {
    state = {
        __key: this.props.location.state && this.props.location.state.__key ? this.props.location.state.__key : 'normal',
        myTask: {
            wait: 0,
            doing: 0,
            done: 0
        }
    }
    getMyTaskStatus = () => {
        ajax('get', `/task/${this.props.user.id}/personal-status`)
            .then(res => {
                this.setState({
                    myTask: {
                        ...res.data
                    }
                })
            })
    }
    onTabChange = (key) => {
        this.props.history.replace(this.props.location.pathname, {
            page: 1,
            __key: key
        })

        this.setState({
            __key: key
        })
    }
    render() {
        const state = this.state
        return (
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <Card bordered={false}>
                    <Card.Grid>
                        待办任务
                        <span className="pull-right">{state.myTask.wait}</span>
                    </Card.Grid>
                    <Card.Grid>
                        正在进行任务
                        <span className="pull-right">{state.myTask.doing}</span>
                    </Card.Grid>
                    <Card.Grid>
                        已完成任务
                        <span className="pull-right">{state.myTask.done}</span>
                    </Card.Grid>
                </Card>
                <Tabs defaultActiveKey={state.__key} onTabClick={this.onTabChange} animated={false}>
                    <TabPane tab="普通任务" key="normal">
                        <NoProjectPersonalTask {...this.props} getMyTaskStatus={this.getMyTaskStatus} />
                    </TabPane>
                    <TabPane tab="项目任务" key="project">
                        <HasProjectPersonalTask {...this.props} getMyTaskStatus={this.getMyTaskStatus} />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default MyMission
