/**
 * 整体页面架构
 * @description
 * @author 吴燕萍
 * @date 2017/11/22
 */
import './BasicLayout.less'
import 'STYLE/css/theme.less'
import React from 'react'
import moment from 'moment'
import cs from 'classnames'
import 'UTILS/weather.js'
import {
    Layout,
    Menu,
    Breadcrumb,
    Icon,
    Dropdown,
    Avatar,
    Tabs,
    Popover,
    List,
    Button,
    Badge,
    message
} from 'antd'
import {
    Link,
    Route,
    Switch,
    Redirect
} from 'react-router-dom'

import io from 'socket.io-client'

import {ajax} from 'UTILS/ajax'
import {isArray} from 'UTILS/utils'

import {ntfcTitle, ntfcUrl} from 'UTILS/notification'

const { Header, Content, Footer, Sider } = Layout
const SubMenu = Menu.SubMenu
const TabPane = Tabs.TabPane

// 重整路由结构
function resetRoute(routes) {
    let arr = []
    routes.forEach(r => {
        let obj = {}
        if (r.routes) {
            r.routes.forEach(rc => {
                if (rc.routes) {
                    let children = []
                    rc.routes.forEach(rcc => {
                        obj = {
                            component: rcc.component,
                            name: `${r.name},${rc.name},${rcc.name}`,
                            path: `${r.path}${rc.path}${rcc.path}`
                        }
                        children.push(obj)
                    })
                    arr.push(children)
                }
                obj = {
                    component: rc.component,
                    name: `${r.name},${rc.name}`,
                    path: `${r.path}${rc.path}`
                }
                arr.push(obj)
            })
        } else {
            obj = {
                component: r.component,
                name: r.name,
                path: r.path
            }
            arr.push(obj)
            if (r.path === '/404' || r.path === '/no-permission') { // 404和无权限页面默认加入
                arr.push(obj)
            }
        }
    })
    return arr
}

// 模块的内容
const ModelContent = ({breadcrumbs, children}) => (
    <Content style={{ margin: '0 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbs.map((breadcrumb, idx) => (
                <Breadcrumb.Item key={idx}>{breadcrumb}</Breadcrumb.Item>
            ))}
        </Breadcrumb>
        {children}
    </Content>
)

class BasicLayout extends React.Component {
    rootSubmenuKeys = this.props.routes.map((route, idx) => {
        return route.path
    })
    state = {
        selectedKeys: [this.rootSubmenuKeys[0]],
        openKeys: [this.rootSubmenuKeys[0]],
        // 通知需要的状态
        notificationActiveTab: 'Project', // 通知气泡卡片切换
        allNotificationData: [], // 全部未读的通知
        notificationData: { // 通知分类
            'Project': [],
            'Task': [],
            'Problem': []
        },
        notificationLoading: true, // 通知加载状态
        notificationNumber: 0 // 通知数量
    }
    componentDidMount() {
        console.log(this.props.user)
        let currentPath = this.props.location.pathname.split('home')[1]
        if (currentPath.split('/').length > 2) {
            this.setState({
                openKeys: [`/${currentPath.split('/')[1]}`],
                selectedKeys: [currentPath]
            })
        } else {
            this.setState({
                selectedKeys: [currentPath]
            })
        }
        if (this.props.user) { // 防止未登录用户访问系统时，天气自动加载
            tpwidget('show') // 天气
        }

        // 获取未读通知
        this.getNotificationData()
        // 启动socket.io
        this.setIo()
    }

    /**
     * [启动socket io]
     * @Author   szh
     * @DateTime 2018-01-24
     */
    setIo = () => {
        ajax('get', '/hostname')
        .then(res => {
            // websocket 通知
            const socket = io(`${res.data.protocol}://${res.data.hostname}:${res.data.port}`)
            socket.on('notification', (notification) => {
                if (isArray(notification)) { // 多条通知
                    this.setState(prevState => {
                        let obj = prevState.notificationData
                        let num = prevState.notificationNumber
                        notification.forEach(n => {
                            if (n.Users.find(user => user.id === this.props.user.id)) {
                                obj[n.model].unshift(n)
                                num++
                            }
                        })
                        return {
                            notificationData: obj,
                            notificationNumber: num
                        }
                    })
                } else { // 单条通知
                    if (notification.isPublic === '1') { // 全部人都能看到
                        this.setState(prevState => {
                            let obj = prevState.notificationData
                            obj[notification.model].unshift(notification)
                            let num = prevState.notificationNumber
                            num++
                            return {
                                notificationData: obj,
                                notificationNumber: num
                            }
                        })
                    }
                }
            })
        })
    }

    /**
     * [获取所有未读通知]
     * @Author   szh
     * @DateTime 2018-01-17
     */
    getNotificationData = () => {
        this.setState({
            notificationLoading: true
        })
        ajax('get', '/notification', {
            uid: this.props.user && this.props.user.id ? this.props.user.id : 0
        })
        .then(res => {
            const publicNotification = localStorage && localStorage.getItem('publicNotification') ? localStorage.getItem('publicNotification').split(',') : []
            this.setState(prevState => {
                let obj = {
                    'Project': [],
                    'Task': [],
                    'Problem': []
                }
                let num = 0
                let allData = []
                res.data.forEach(d => {
                    if (d.isPublic === '1') { // 公共通知
                        if (!publicNotification.includes(`${d.id}`)) { // 没有本地已读才显示
                            obj[d.model].unshift(d)
                            num++
                            allData.unshift(d)
                        }
                    } else {
                        obj[d.model].unshift(d)
                        num++
                        allData.unshift(d)
                    }
                })
                return {
                    allNotificationData: allData,
                    notificationData: {
                        ...obj,
                    },
                    notificationLoading: false,
                    notificationNumber: num,
                }
            })
        })
    }

    /**
     * [设置已读]
     * @Author   szh
     * @DateTime 2018-01-18
     * @param    {Array}   nids [设置已读的通知ids]
     */
    setNotificationRead = (nids) => {
        ajax('put', '/notification/read', {
            user_id: this.props.user.id,
            notification_ids: nids
        })
        .then(res => {
            if (res.data.length > 0) {
                this.setState(prevState => {
                    let obj = prevState.notificationData
                    res.data.forEach(d => {
                        obj[d.model].splice(
                            obj[d.model].findIndex(idx => idx.id === d.id),
                            1
                        )
                    })
                    let number = 0
                    for (let i in obj) {
                        number += obj[i].length
                    }
                    return {
                        notificationData: obj,
                        notificationNumber: number,
                    }
                })
            }
        })
    }

    // 单个通知已读
    singleNotificationRead = (ntfc) => {
        if (ntfc.isPublic === '0') {
            this.setNotificationRead([parseInt(ntfc.id)])
        } else {
            this.localStorageNotificationRead([parseInt(ntfc.id)])
        }
    }

    // 多个通知已读
    multipleNotificationRead = (type) => {
        let nids = [] // 非公开的通知
        let pnids = [] // 公开的通知
        this.state.notificationData[type].forEach(n => {
            if (n.isPublic === '0') {
                nids.push(n.id)
            } else {
                pnids.push(n.id)
            }
        })
        if (nids.length > 0) {
            this.setNotificationRead(nids)
        }
        if (pnids.length > 0) {
            this.localStorageNotificationRead(pnids)
        }
    }

    // 使用本地存储记录公共已读通知
    localStorageNotificationRead = (pnids) => {
        if (localStorage) {
            if (!localStorage.getItem('publicNotification')) {
                localStorage.setItem('publicNotification', '')
            }
            let publicNotification = localStorage.getItem('publicNotification')
            if (publicNotification.length > 0) {
                publicNotification = publicNotification.split(',')
            } else {
                publicNotification = []
            }
            pnids.forEach(pn => {
                publicNotification.push(pn)
            })
            localStorage.setItem('publicNotification', publicNotification.join(','))
            this.setState(prevState => {
                let data = prevState.notificationData
                let arr = [].concat(data['Problem'], data['Task'], data['Project'])
                let obj = {
                    'Project': [],
                    'Task': [],
                    'Problem': []
                }
                pnids.forEach(pn => {
                    arr.splice(
                        arr.findIndex(idx => parseInt(idx.id) === parseInt(pn.id)),
                        1
                    )
                })
                arr.forEach(a => {
                    obj[a.model].unshift(a)
                })
                return {
                    notificationData: obj,
                    notificationNumber: arr.length
                }
            })
        }
    }

    // 侧边栏打开时的回调
    onOpenChange = (openKeys) => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1)
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys })
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : []
            })
        }
    }

    onClick = ({ item, key, selectedKeys }) => {
        this.setState({
            selectedKeys: [key]
        })
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    /**
     * [登出]
     * @Author   szh
     * @DateTime 2018-01-17
     */
    logout = () => {
        axios.get('/user/logout')
        .then(res => {
            this.props.globalUpdateUser(null)
            this.props.history.push('/login')
        })
    }

    /**
     * [生成单条通知结构]
     * @Author   szh
     * @DateTime 2018-01-18
     * @param    {Object}   ntfc [通知数据]
     * @return   {ReactNode}     [单个通知结构]
     */
    notificationMsg = (ntfc) => {
        let title = ntfcTitle(ntfc)
        return (
            <div>
                <div className="notication-tit mb-10" title={title}>{title}</div>
                <div className="txt-l">{moment(ntfc.date).startOf().fromNow()}</div>
            </div>
        )
    }

    // /**
    //  * [生成单条通知的地址]
    //  * @Author   szh
    //  * @DateTime 2018-01-23
    //  * @param    {Object}   ntfc [通知数据]
    //  * @return   {String}        [详细页路径]
    //  */
    // notificationUrl = (ntfc) => {
    //     let url = ntfcUrl(ntfc)
    //     this.setNotificationRead([parseInt(ntfc.id)])
    //     if (this.props.location.pathname === `${this.props.match.path}${url}`) {
    //         message.info('已经在任务详情页')
    //     } else {
    //         this.props.history.push(`${this.props.match.path}${url}`)
    //     }
    // }

    // 给其他页面提供设置这里的state的openKeys和selectedKeys的值
    BLhandleLinkClick = (openKeys, selectedKeys) => {
        this.setState((prevState, props) => {
            return {
                openKeys: [openKeys],
                selectedKeys: [selectedKeys]
            }
        })
    }

    render() {
        const {
            routes,
            history,
            location,
            match,
            user,
            collapsed,
            permissionRoutes
        } = this.props
        const newRoutes = resetRoute(permissionRoutes)
        const AvatarMenu = (
            <Menu>
                <Menu.Item key="0">
                    <Link to="/home/personal/info" onClick={() => this.BLhandleLinkClick('/personal', '/personal/info')}><Icon type="idcard" style={{marginRight: '8px'}} />个人信息</Link>
                </Menu.Item>
                <Menu.Item key="1">
                    <Link to="/home/system/setting" onClick={() => this.BLhandleLinkClick('/system', '/system/setting')}><Icon type="setting" style={{marginRight: '8px'}} />设置</Link>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3">
                    <span onClick={this.logout}><Icon type="logout" style={{marginRight: '8px'}} />退出登录</span>
                </Menu.Item>
            </Menu>
        )

        const dynamicSider = (
            <div>
                <div className="logo" />
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={this.state.selectedKeys}
                    openKeys={this.state.openKeys}
                    onOpenChange={this.onOpenChange}
                    onClick={this.onClick}
                >
                    {permissionRoutes.map((route, idx) => {
                        if (route.routes) {
                            return (
                                <SubMenu
                                    key={route.path}
                                    title={<span><Icon type={route.icon} style={{fontSize: 16}} /><span style={{fontSize: 14}}>{route.name}</span></span>}
                                >
                                    {
                                        route.routes.map((child, sn) => (
                                            <Menu.Item key={`${route.path}${child.path}`}>
                                                <Link to={`${match.path}${route.path}${child.path}`}>{child.name}</Link>
                                            </Menu.Item>
                                        ))
                                    }
                                </SubMenu>
                            )
                        } else {
                            return (
                                <Menu.Item key={route.path}>
                                    <Link to={`${match.path}${route.path}`}>
                                        <Icon type={route.icon} style={{fontSize: 16}} />
                                        <span style={{fontSize: 14}}>{route.name}</span>
                                    </Link>
                                </Menu.Item>
                            )
                        }
                    })}
                </Menu>
            </div>
        )
        const tabs = [
            {tab: '项目', key: 'Project'},
            {tab: '任务', key: 'Task'},
            {tab: '问题', key: 'Problem'},
        ]
        const notification = (
            <Tabs defaultActiveKey={this.state.notificationActiveTab} animated={false}>
                {tabs.map(item => (
                    <TabPane tab={item.tab} key={item.key}>
                        {this.state.notificationData[item.key].length > 0 ? (
                            <div className="txt-c notification-container">
                                <List
                                    className="notification-list"
                                    loading={this.state.notificationLoading}
                                    dataSource={this.state.notificationData[item.key]}
                                    itemLayout="horizontal"
                                    renderItem={item => (
                                        <List.Item actions={[<a href="javascript:;" onClick={() => this.singleNotificationRead(item)}>已读</a>]}>
                                            {/* <a href="javascript:;" onClick={() => this.notificationUrl(item)}>详情</a> */}
                                            {this.notificationMsg(item)}
                                        </List.Item>
                                    )}
                                />
                                <Button className="mt-10" onClick={() => this.multipleNotificationRead(item.key)}>清除全部通知</Button>
                            </div>
                        ) : (
                            <div className="txt-c notification-container">
                                已经查看所有通知
                            </div>
                        )}
                    </TabPane>
                ))}
            </Tabs>
        )

        const dynamicLayout = (
            <div>
                <Header className="layout-header" >
                    <Icon
                        className="trigger"
                        type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={this.toggle}
                    />
                    <div className="pull-right layout-header-avatar">
                        <Dropdown overlay={AvatarMenu}>
                            <div style={{ lineHeight: '64px' }}>
                                <Avatar style={{ verticalAlign: 'middle' }} src={user && user.avatar ? `/uploadImgs/${user.avatar}` : null} icon="user" />
                                <span className="ml-10">{user && user.realname ? user.realname : '请先登录'}</span>
                            </div>
                        </Dropdown>
                    </div>
                    <div className="pull-right layout-header-bell mr-10">
                        <div id="tp-weather-widget" style={{display: 'inline-block'}} className="mr-10" />
                        <Popover placement="bottomRight" content={notification} trigger="hover">
                            <Badge count={this.state.notificationNumber}>
                                <Icon type={'bell'} style={{fontSize: 16}} />
                            </Badge>
                        </Popover>
                    </div>
                </Header>
                <Route exact path={match.path} render={() => {
                    return <Redirect to={`${match.path}/default`} />
                }} />
                {
                    newRoutes.map((route, idx) => {
                        if (isArray(route)) {
                            return (
                                <Switch key={idx}>
                                    {
                                        route.map((rc, sn) => (
                                            <Route
                                                key={sn}
                                                exact
                                                path={`${match.path}${rc.path}`}
                                                render={props => (
                                                    <ModelContent breadcrumbs={rc.name.split(',')}>
                                                        <rc.component
                                                            BLhandleLinkClick={this.BLhandleLinkClick}
                                                            route={rc} {...props}
                                                            user={this.props.user}
                                                            globalUpdateUser={this.props.globalUpdateUser}
                                                        />
                                                    </ModelContent>
                                                )} />
                                        ))
                                    }
                                </Switch>
                            )
                        } else {
                            return (
                                <Route
                                    key={idx}
                                    exact
                                    path={`${match.path}${route.path}`}
                                    render={props => (
                                        <ModelContent breadcrumbs={route.name.split(',')}>
                                            {/* notificationData是给default页通知数据 */}
                                            <route.component
                                                notificationData={this.state.allNotificationData}
                                                BLhandleLinkClick={this.BLhandleLinkClick}
                                                route={route} {...props}
                                                user={this.props.user}
                                                globalUpdateUser={this.props.globalUpdateUser}
                                            />
                                        </ModelContent>
                                    )} />
                            )
                        }
                    })
                }
                <Footer style={{ textAlign: 'center' }}>
                    szy公司系统 ©2017 Created by szy
                </Footer>
            </div>
        )
        const Class = cs({
            [`${user && user.skin}`]: user && user.skin !== null,
            [`${user && user.font_size}`]: user && user.font_size !== null,
            default: user && user.skin === null,
            middle: user && user.font_size === null,
            BasicLayout: true
        })
        return (
            <Layout
                style={{ minHeight: '100vh' }}
                className={Class}
            >
                <Sider
                    className="Sider"
                    collapsed={this.state.collapsed}
                >
                    {dynamicSider}
                </Sider>
                <Layout>
                    {dynamicLayout}
                </Layout>
            </Layout>
        )
    }
}

export default BasicLayout
