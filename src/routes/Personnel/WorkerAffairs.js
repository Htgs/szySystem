// 人员管理
import React, {Component} from 'react'
import {
    Icon,
    Button,
    Table,
    Avatar,
    DatePicker,
    Input,
    Radio,
    message,
    Divider,
    Select
} from 'antd'
import {
    Link,
    Route,
    Switch,
    Redirect
} from 'react-router-dom'

// 引入工具方法
import {isObject, isArray, valueToMoment} from 'UTILS/utils'
import {ajax, index, store, show, update, destroy} from 'UTILS/ajax'

import BasicOperation from 'COMPONENTS/basic/BasicOperation'

import CustomRangePicker from 'COMPONENTS/date/CustomRangePicker'
import CustomDatePicker from 'COMPONENTS/date/CustomDatePicker'
import CustomModal from 'COMPONENTS/modal/CustomModal'
import CustomForm from 'COMPONENTS/form/CustomForm'

import withBasicDataModel from 'COMPONENTS/hoc/withBasicDataModel'

const RadioGroup = Radio.Group

class WorkerAffairs extends Component {
    render() {
        const {
            child,
            route,
            history,
            location,
            match
        } = this.props

        const entryDate = {
            format: 'YYYY-MM-DD',
            showTime: false,
            style: {
                width: 220
            }
        }
        const quitDate = {
            format: 'YYYY-MM-DD',
            showTime: false,
            style: {
                width: 220
            }
        }
        const condition = [
            {
                label: '姓名',
                field: 'realname',
                component: (<Input autoComplete="off" placeholder="姓名" />)
            },
            {
                label: '邮箱',
                field: 'email',
                component: (<Input autoComplete="off" placeholder="邮箱" />)
            },
            {
                label: '职位',
                field: 'job',
                component: (<Input autoComplete="off" placeholder="职位" />)
            },
            {
                label: '入职日期',
                field: 'entry_date',
                component: <CustomRangePicker {...entryDate} />,
            },
            {
                label: '离职日期',
                field: 'quit_date',
                component: <CustomRangePicker {...quitDate} />,
            }
        ]
        const operationBtn = [
            () => <Button type="primary" onClick={this.props.handleAdd}>新增</Button>,
            () => <Button type="danger" onClick={this.props.handleDelete}>删除</Button>
        ]

        // 表格
        const columns = [
            {
                title: '用户名',
                dataIndex: 'name',
                key: 'name',
                width: 70
            },
            {
                title: '姓名',
                dataIndex: 'realname',
                key: 'realname',
                width: 70
            },
            {
                title: '性别',
                dataIndex: 'gender',
                key: 'gender',
                width: 50,
                render: text => <span>{text === 'male' ? '男' : '女'}</span>
            },
            {
                title: '邮箱',
                dataIndex: 'email',
                key: 'email'
            },
            {
                title: '电话',
                dataIndex: 'phone',
                key: 'phone'
            },
            {
                title: '出生日期',
                dataIndex: 'birth_date',
                key: 'birth_date'
            },
            {
                title: '头像',
                dataIndex: 'avatar',
                key: 'avatar',
                render: text => <Avatar src={text} />
            },
            {
                title: '职位',
                dataIndex: 'job',
                key: 'job'
            },
            {
                title: '入职日期',
                dataIndex: 'entry_date',
                key: 'entry_date'
            },
            {
                title: '离职日期',
                dataIndex: 'quit_date',
                key: 'quit_date'
            },
            {
                title: '用户类型',
                dataIndex: 'type',
                key: 'type',
                render: text => <span>{text === '0' ? '最高级管理' : text === '1' ? '管理' : '普通用户'}</span>
            },
            {
                title: '操作',
                key: 'action',
                width: 200,
                render: (text, record) => (
                    <span>
                        <a href="javascript:;" data-id={text.id} onClick={this.props.handleEdit}>编辑</a>
                        <Divider type="vertical" />
                        <a href="javascript:;" data-id={text.id} onClick={this.props.handleDelete}>删除</a>
                    </span>
                )
            }
        ]
        const rowSelection = {
            onChange: this.props.handleTableRowChange
        }

        // 表单
        const formFields = [
            {
                label: '用户名',
                field: 'name',
                valid: {
                    rules: [{required: true, message: '请输入用户名'}]
                },
                component: (<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} autoComplete="off" placeholder="用户名" />),
            },
            {
                label: '姓名',
                field: 'realname',
                valid: {
                    rules: [{required: true, message: '请输入姓名'}]
                },
                component: (<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} autoComplete="off" placeholder="姓名" />)
            },
            {
                label: '性别',
                field: 'gender',
                valid: {
                    rules: [{required: true, message: '请选择性别'}]
                },
                component: (
                    <RadioGroup>
                        <Radio value="male">男</Radio>
                        <Radio value="female">女</Radio>
                    </RadioGroup>
                )
            },
            {
                label: '邮箱',
                field: 'email',
                valid: {
                    rules: [{
                        type: 'email', message: '邮箱格式不对'
                    }, {
                        required: true, message: '请输入邮箱'
                    }]
                },
                component: (<Input prefix={<Icon type="mail" style={{ fontSize: 13 }} />} autoComplete="off" placeholder="邮箱" />)
            },
            {
                label: '电话',
                field: 'phone',
                valid: {
                    rules: [{ required: true, message: '请输入你的电话' }]
                },
                component: (<Input prefix={<Icon type="phone" style={{ fontSize: 13 }} />} autoComplete="off" placeholder="电话" />)
            },
            {
                label: '出生日期',
                field: 'birth_date',
                valid: {
                    rules: [{required: true, message: '请选择出生日期'}]
                },
                component: <CustomDatePicker format="YYYY-MM-DD" showTime={false} />,
            },
            {
                label: '职位',
                field: 'job',
                valid: {
                    rules: [{required: true, message: '请输入职位'}]
                },
                component: (<Input autoComplete="off" placeholder="职位" />)
            },
            {
                label: '入职日期',
                field: 'entry_date',
                valid: {
                    rules: [{required: true, message: '请选择入职日期'}]
                },
                component: <CustomDatePicker format="YYYY-MM-DD" showTime={false} />,
            },
            {
                label: '离职日期',
                field: 'quit_date',
                component: <CustomDatePicker format="YYYY-MM-DD" showTime={false} />,
            }
        ]

        return (
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <CustomForm
                    layout="inline"
                    formStyle={{width: '100%'}}
                    customFormOperation={<Button type="primary" htmlType="submit">查询</Button>}
                    formFields={condition}
                    handleSubmit={this.props.handleQuery}
                    updateFormFields={this.props.updateQueryFields}
                    formFieldsValues={this.props.queryFieldValues}
                />
                <BasicOperation className="mt-10 mb-10" operationBtns={operationBtn} />
                <Table {...this.props.tableSetting} rowKey={record => record.id} columns={columns} rowSelection={rowSelection} />
                <CustomModal {...this.props.modalSetting} footer={null} onCancel={this.props.handleModalCancel}>
                    <CustomForm
                        formStyle={{width: '100%'}}
                        formFields={formFields}
                        handleSubmit={this.props.handleFormSubmit}
                        updateFormFields={this.props.updateFormFields}
                        formFieldsValues={this.props.formFieldsValues}
                        isSubmitting={this.props.isSubmitting}
                    />
                </CustomModal>
            </div>
        )
    }
}

const WA = withBasicDataModel(WorkerAffairs, {
    model: 'user',
    title: '人员管理',
    tableSetting: {},
    modalSetting: {
        title: '人员管理'
    },
    queryFieldValues: {
        realname: {
            value: null
        },
        email: {
            value: null
        },
        job: {
            value: null
        },
        entry_date: {
            value: null
        },
        quit_date: {
            value: null
        }
    },
    formFieldsValues: {
        id: {
            value: null
        },
        name: {
            value: null
        },
        realname: {
            value: null
        },
        gender: {
            value: null
        },
        email: {
            value: null
        },
        phone: {
            value: null
        },
        birth_date: {
            value: null
        },
        job: {
            value: null
        },
        entry_date: {
            value: null
        },
        quit_date: {
            value: null
        }
    },
})

export default WA
