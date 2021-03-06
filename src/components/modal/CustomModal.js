import React from 'react'
import { Modal, Button } from 'antd'
import 'STYLE/css/theme.less'
import cs from 'classnames'

class CustomModal extends React.Component {
    render() {
        // afterClose  Modal 完全关闭后的回调  function    无
        // bodyStyle   Modal body 样式   object  {}
        // cancelText  取消按钮文字  string  取消
        // closable    是否显示右上角的关闭按钮    boolean true
        // confirmLoading  确定按钮 loading    boolean 无
        // footer  底部内容，当不需要默认底部按钮时，可以设为 footer={null} string|ReactNode    确定取消按钮
        // getContainer    指定 Modal 挂载的 HTML 节点    (instance): HTMLElement () => document.body
        // mask    是否展示遮罩  Boolean true
        // maskClosable    点击蒙层是否允许关闭  boolean true
        // maskStyle   遮罩样式    object  {}
        // okText  确认按钮文字  string  确定
        // okType  确认按钮类型  string  primary
        // style   可用于设置浮层的样式，调整浮层位置等  object  -
        // title   标题  string|ReactNode    无
        // visible 对话框是否可见 boolean 无
        // width   宽度  string|number   520
        // wrapClassName   对话框外层容器的类名  string  -
        // zIndex  设置 Modal 的 z-index  Number  1000
        // onCancel    点击遮罩层或右上角叉或取消按钮的回调  function(e) 无
        // onOk    点击确定回调  function(e)
        const props = {
            maskClosable: false // 默认设置点击遮罩层不能关闭对话框
        }
        for (let i in this.props) {
            if (i === 'children') continue
            props[i] = this.props[i]
        }
        const user = this.props.user
        const Class = cs({
            [`${user && user.skin}`]: true,
            [`${user && user.font_size}`]: true
        })
        return (
            <Modal {...props} className={Class}>
                {this.props.children}
            </Modal>
        )
    }
}

export default CustomModal
