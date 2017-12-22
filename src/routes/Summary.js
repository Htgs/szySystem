import React, {Component} from 'react'
import {
    Input,
    Button,
    Table,
    Divider
} from 'antd'
import {
    Link,
    Route,
    Switch,
    Redirect
} from 'react-router-dom'
import ReactQuill from 'react-quill'
// 引入工具方法
import {isObject, isArray, valueToMoment, resetObject} from 'UTILS/utils'
import {ajax} from 'UTILS/ajax'

import BasicOperation from 'COMPONENTS/basic/BasicOperation'

import CustomModal from 'COMPONENTS/modal/CustomModal'
import CustomForm from 'COMPONENTS/form/CustomForm'
import CustomRangePicker from 'COMPONENTS/date/CustomRangePicker'

import withBasicDataModel from 'COMPONENTS/hoc/withBasicDataModel'

/**
 * [escape 过滤script标签]
 * @DateTime 2017-12-11
 * @param    {string}   str [html标签字符串]
 * @return   {string}       [过滤后的html标签字符串]
 */
function escape(str) {
    return str.replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--')
}

class Summary extends Component {
    componentDidMount() {
        let page = this.props.location.state ? this.props.location.state.page : 1
        this.props.getData({
            page: 1,
        })
    }
    render() {
        const {
            child,
            route,
            history,
            location,
            match,
            user
        } = this.props

        const condition = [
            {
                label: '作者',
                field: 'realname',
                component: (<Input autoComplete="off" placeholder="作者" />)
            },
            {
                label: '关键字',
                field: 'keyword',
                component: (<Input autoComplete="off" placeholder="关键字" />)
            },
            {
                label: '发表日期',
                field: 'date',
                component: (<CustomRangePicker showTime={false} format={'YYYY-MM-DD'} />)
            }
        ]
        const operationBtn = [
            // () => (
            //     <Link to={`${match.url}/add`}>
            //         <Button type="primary">
            //             发表总结
            //         </Button>
            //     </Link>
            // )
        ]

        const columns = [
            {
                title: '作者',
                dataIndex: 'realname',
                key: 'realname',
            },
            {
                title: '标题',
                dataIndex: 'title',
                key: 'title',
                width: 350,
            },
            {
                title: '发表时间',
                dataIndex: 'date',
                key: 'date',
            },
            // {
            //     title: '操作',
            //     key: 'action',
            //     render: (text, record) => {
            //         if (text.user_id === user.id) {
            //             return (
            //                 <span>
            //                     <Link to={`${match.path}/${text.id}`}>编辑</Link>
            //                     <Divider type="vertical" />
            //                     <a href="javascript:;" data-id={text.id} onClick={this.props.handleDelete}>删除</a>
            //                 </span>
            //             )
            //         } else {
            //             return (
            //                 <span />
            //             )
            //         }
            //     }
            // }
        ]

        const tableExpandedRowRender = (record) => {
            console.log(record.content)
            let content = escape(record.content)
            console.log(content)
            return (
                <div dangerouslySetInnerHTML={{__html: content}} />
            )
        }

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
                <Table {...this.props.dataSetting} rowKey={record => record.id} columns={columns} expandedRowRender={tableExpandedRowRender} />
            </div>
        )
    }
}

const Sy = withBasicDataModel(Summary, {
    model: 'summary',
    queryFieldValues: {
        realname: {
            value: null
        },
        keyword: {
            value: null
        },
        date: {
            value: null
        }
    },
    handleData: (dataSource) => {
        let arr = []
        dataSource.forEach(data => {
            arr.push(resetObject(data))
        })
        return arr
    },
    customGetData: true
})

export default Sy