import React, {Component} from 'react'
import {
    Input,
    Button,
    Table,
    Divider,
    message,
    Select,
    Upload,
    Icon
} from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// 引入工具方法
import {isObject, isArray, valueToMoment, resetObject, formatDate} from 'UTILS/utils'
import {ajax, show} from 'UTILS/ajax'

import BasicOperation from 'COMPONENTS/basic/BasicOperation'

import CustomModal from 'COMPONENTS/modal/CustomModal'
import CustomForm from 'COMPONENTS/form/CustomForm'
import CustomDatePicker from 'COMPONENTS/date/CustomDatePicker'

import withBasicDataModel from 'COMPONENTS/hoc/withBasicDataModel'

const Option = Select.Option
const Dragger = Upload.Dragger

// 去除html标签
function removeHtml(str) {
    return str.replace(/<\/?.+?>/g, '').replace(/ /g, '')
}

const {TextArea} = Input

class TechnologyEdit extends Component {
    state = {
        types: [], // 全部技术类型
        fileList: [], // 附件
        allFiles: [], // 记录当前技术文章的全部附件
    }
    componentWillMount() {
        this.getAllTechtype()
        if (this.props.match.params.id) {
        // 编辑
            this.getData()
        } else {
        // 新增
            this.props.handleSetState('operationType', 'add')
        }
    }
    getData = () => {
        if (!this.props.user) {
            this.props.history.push('/login')
        }
        const hide = message.loading('数据读取中', 0)
        show(`technology/${this.props.match.params.id}`)
            .then(res => {
                setTimeout(hide, 0)
                let files = JSON.parse(res.data.files),
                    fileList = [],
                    allFiles = []
                Object.keys(files).forEach((file, idx) => {
                    fileList.push({
                        uid: -(idx + 1),
                        name: files[file],
                        status: 'done',
                        url: `/uploadFiles/${file}`,
                    })
                    allFiles.push({
                        name: files[file],
                        url: file
                    })
                })
                this.setState({
                    fileList: fileList,
                    allFiles: allFiles
                })
                if (parseInt(res.data.id) === parseInt(this.props.match.params.id)) {
                    // 直接更新内部表单数据
                    this.props.updateEditFormFieldsValues(res.data)
                } else {
                    this.props.history.push('/home/404')
                }
            })
    }
    goBack = (e) => {
        this.props.history.goBack()
    }

    getAllTechtype() {
        ajax('get', '/techtype/all')
        .then(res => {
            this.setState({
                types: res.data
            })
        })
    }

    handleFormSubmit = (values) => {
        let params = {
            user_id: this.props.user.id,
        }
        if (!this.props.match.params.id) {
            params['date'] = formatDate(true)
        }
        for (let i in values) {
            params[i] = values[i]
        }
        // 处理附件
        let hasFiles = [], // 记录服务器保留的文件
            removeFiles = [], // 记录删除的文件
            fileList = [] // 保存新增的附件
        // 全部文件列表
        this.state.fileList.forEach(fl => {
            if (fl.url) {
                // 服务器已经有的文件
                hasFiles.push({
                    name: fl.name,
                    url: fl.url.split('/')[fl.url.split('/').length - 1]
                })
            } else {
                // 新增文件
                fileList.push(fl)
            }
        })
        // 记录删除的文件列表
        this.state.allFiles.forEach(f => {
            if (hasFiles.find(fl => fl.url === f.url)) {
            } else {
                removeFiles.push(f)
            }
        })
        params['hasFiles'] = JSON.stringify(hasFiles)
        params['removeFiles'] = JSON.stringify(removeFiles)
        params['files'] = {fileList: fileList}
        if (removeHtml(params.content) !== '') {
            this.props.handleFormSubmit(params, (res) => {
                message.success('保存成功')
                setTimeout(() => {
                    this.props.history.push('/home/share/technology')
                }, 200)
            })
        } else {
            message.info('请输入内容再提交')
        }
    }
    render() {
        const {
            child,
            route,
            history,
            location,
            match
        } = this.props
        const {
            types
        } = this.state
        const operationBtn = [
            () => (
                <Button className="pull-right" type="primary" onClick={this.goBack}>
                    返回
                </Button>
            )
        ]

        const filesProps = {
            action: '/technology',
            onRemove: (file) => {
                this.setState(prevState => {
                    let arr = prevState.fileList
                    arr.splice(
                        arr.findIndex(item => item.uid === file.uid),
                        1
                    )
                    return {
                        fileList: arr
                    }
                })
            },
            beforeUpload: (file) => {
                if (file.size > 2 * 1024 * 1024) {
                    message.error('上传文件不能超过2m')
                    return false
                }
                this.setState(prevState => {
                    let arr = prevState.fileList
                    arr.push(file)
                    return {
                        fileList: arr
                    }
                })
                return false
            },
            multiple: true,
            fileList: this.state.fileList,
        }

        const condition = [
            {
                label: '标题',
                content: ({getFieldDecorator}) => {
                    return getFieldDecorator('title', {
                        rules: [{required: true, message: '请输入标题'}]
                    })(<Input autoComplete="off" placeholder="标题" />)
                },
            },
            {
                label: '类型',
                content: ({getFieldDecorator}) => {
                    return getFieldDecorator('type_id', {
                        rules: [{required: true, message: '请选择类型'}]
                    })(
                        <Select
                            style={{width: 120}}
                            placeholder="请选择类型"
                            allowClear
                        >
                            {types.map(type => (
                                <Option value={type.id} key={type.id}>{type.name}</Option>
                            ))}
                        </Select>
                    )
                },
            },
            {
                label: '内容',
                formItemStyle: {
                    height: 350
                },
                content: ({getFieldDecorator}) => {
                    return getFieldDecorator('content', {
                    })(<ReactQuill placeholder="内容" style={{height: 300}} />)
                },
            },
            {
                label: '附件',
                content: ({getFieldDecorator}) => {
                    return getFieldDecorator('files', {
                    })(
                        <Upload {...filesProps}>
                            <Button type="ghost">
                                <Icon type="upload" /> 点击上传
                            </Button>
                        </Upload>
                    )
                },
            }
        ]
        return (
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                <BasicOperation className="mt-10 mb-10 clearfix" operationBtns={operationBtn} />
                <CustomForm
                    formStyle={{width: '80%'}}
                    formFields={condition}
                    handleSubmit={this.handleFormSubmit}
                    updateFormFields={this.props.updateFormFields}
                    formFieldsValues={this.props.formFieldsValues}
                />
            </div>
        )
    }
}

const TE = withBasicDataModel(TechnologyEdit, {
    model: 'technology',
    formFieldsValues: {
        id: {
            value: null
        },
        title: {
            value: null
        },
        content: {
            value: null
        },
        type_id: {
            value: undefined
        },
        files: {
            value: null
        },
    },
    formSubmitHasFile: true,
    customGetData: true
})

export default TE
