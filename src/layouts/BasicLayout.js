/**
 * 整体页面架构
 * @description
 * @author 吴燕萍
 * @date 2017/11/22
 */
import styles from './BasicLayout.less'
import 'STYLE/css/theme.less'
import React from 'react'
import cs from 'classnames'
import {
    Layout,
    Menu,
    Breadcrumb,
    Icon,
    Dropdown,
    Avatar
} from 'antd'

import {
    Link,
    Route,
    Switch,
    Redirect
} from 'react-router-dom'

import {isArray} from 'UTILS/utils'
import {show, update} from 'UTILS/ajax'

const { Header, Content, Footer, Sider } = Layout
const SubMenu = Menu.SubMenu
// 子路由
// function SubRoute({route, idx, match, user, globalUpdateUser}) {
//     return (
//         <Switch>
//             {
//                 route.routes.map((child, sn) => (
//                     <Route
//                         key={`${idx}-${sn}`}
//                         exact
//                         path={`${match.path}${route.path}${child.path}`}
//                         render={props => (
//                             <ModelContent breadcrumbs={[route.name, child.name]}>
//                                 <child.component {...props} child={child} route={route} user={user} globalUpdateUser={globalUpdateUser} />
//                             </ModelContent>
//                         )}
//                     />
//                 ))
//             }
//             {
//                 route.routes.map((child, sn) => {
//                     if (child.routes) {
//                         return (
//                             <Switch key={sn}>
//                                 {child.routes.map((ch, i) => (
//                                     <Route
//                                         key={`${idx}-${sn}-${i}`}
//                                         exact={ch.exact}
//                                         path={`${match.path}${route.path}${child.path}${ch.path}`}
//                                         render={props => (
//                                             <ModelContent breadcrumbs={[route.name, child.name, ch.name]}>
//                                                 <ch.component {...props} route={route} user={user} globalUpdateUser={globalUpdateUser} />
//                                             </ModelContent>
//                                         )}
//                                     />
//                                 ))}
//                             </Switch>
//                         )
//                     }
//                 })
//             }
//         </Switch>
//     )
// }

// function SubRoute({route, idx, mpath, bdcbs, user, globalUpdateUser}) {
//     let breadcrumbs = [].concat(bdcbs)
//     return (
//         <Switch>
//             {
//                 route.routes.map((child, sn) => (
//                     <Route
//                         key={`${idx}-${sn}`}
//                         exact
//                         path={`${mpath}${route.path}${child.path}`}
//                         render={props => (
//                             <ModelContent breadcrumbs={(() => {
//                                 breadcrumbs.push(child.name)
//                                 return breadcrumbs
//                             })()}>
//                                 <child.component {...props} child={child} route={route} user={user} globalUpdateUser={globalUpdateUser} />
//                             </ModelContent>
//                         )}
//                     />
//                 ))
//             }
//             {
//                 route.routes && route.routes.map((child, sn) => (
//                     <SubRoute
//                         key={sn}
//                         route={child}
//                         idx={`${idx}-${sn}`}
//                         mpath={`${mpath}${route.path}`}
//                         bdcbs={(() => {
//                             breadcrumbs.push(child.name)
//                             return breadcrumbs
//                         })()}
//                         user={user}
//                         globalUpdateUser={globalUpdateUser}
//                     />
//                 ))
//             }
//         </Switch>
//     )
// }

function SubRoute({route, idx, mpath, bdcbs, user, globalUpdateUser}) {
    let breadcrumbs = [].concat(bdcbs)
    return (
        <Switch>
            {
                route.routes.map((child, sn) => (
                    <Route
                        key={`${idx}-${sn}`}
                        exact
                        path={`${mpath}${route.path}${child.path}`}
                        render={props => (
                            <ModelContent breadcrumbs={(() => {
                                breadcrumbs.push(child.name)
                                return breadcrumbs
                            })()}>
                                <child.component {...props} child={child} route={route} user={user} globalUpdateUser={globalUpdateUser} />
                            </ModelContent>
                        )}
                    />
                ))
            }
        </Switch>
    )
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
    componentDidMount() {
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
        this.getData()
    }

    rootSubmenuKeys = this.props.routes.map((route, idx) => {
        return route.path
    })

    state = {
        selectedKeys: [this.rootSubmenuKeys[0]],
        openKeys: [this.rootSubmenuKeys[0]],
        skin: '',
        fontSize: ''
    }
    getData = () => {
        let uid = this.props.user.id
        show(`user/${uid}`)
            .then(res => {
                console.log(res)
                this.setState({
                    skin: res.data.skin,
                    fontSize: res.data.font_size
                })
                console.log(this.state.skin)
            })
    }
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

    logout = () => {
        axios.get('/user/logout')
        .then(res => {
            this.props.globalUpdateUser(null)
            this.props.history.push('/login')
        })
        .catch(err => {
            console.log(err)
        })
    }

    render() {
        const {
            routes,
            history,
            location,
            match,
            user,
            collapsed
        } = this.props
        const {skin} = this.state
        const {fontSize} = this.state
        const AvatarMenu = (
            <Menu>
                <Menu.Item key="0">
                    <Link to="/home/personalAffairs/personalInfo">个人信息</Link>
                </Menu.Item>
                <Menu.Item key="1">
                    <Link to="/home/personalAffairs/setting">设置</Link>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3">
                    <span onClick={this.logout}>退出登录</span>
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
                    {routes.map((route, idx) => {
                        if (route.routes) {
                            return (
                                <SubMenu
                                    key={route.path}
                                    title={<span><Icon type={route.icon} style={{fontSize: 16}} /><span style={{fontSize: 14}}>{route.name}</span></span>}
                                >
                                    {
                                        route.routes.map((child, sn) => (
                                            <Menu.Item key={`${route.path}${child.path}`} className={child.disable ? 'hide' : ''} >
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
                        <Icon type={'bell'} style={{fontSize: 16}} />
                    </div>
                </Header>
                <Route exact path={match.path} render={() => (
                    <Redirect to={`${match.path}/default`} />
                )} />
                {
                    routes.map((route, idx) => {
                        if (route.routes) {
                            return (
                                <SubRoute key={idx} route={route} idx={idx} bdcbs={[route.name]} mpath={match.path} user={this.props.user} globalUpdateUser={this.props.globalUpdateUser} />
                            )
                        } else {
                            return (
                                <Route
                                    key={idx}
                                    exact
                                    path={`${match.path}${route.path}`}
                                    render={props => (
                                        <ModelContent breadcrumbs={[route.name]}>
                                            <route.component route={route} {...props} user={this.props.user} globalUpdateUser={this.props.globalUpdateUser} />
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
            [`${skin}`]: true,
            [`${fontSize}`]: true,
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
