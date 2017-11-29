/**
 * 整体页面架构
 * @description
 * @author 吴燕萍
 * @date 2017/11/22
 */
import styles from './BasicLayout.less'
import React from 'react'
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

const { Header, Content, Footer, Sider } = Layout
const SubMenu = Menu.SubMenu

// 子路由
function SubRoute({route, idx, match}) {
    return (
        <Switch>
            {
                route.routes.map((child, sn) => (
                    <Route
                        key={`${idx}-${sn}`}
                        exact={child.exact}
                        path={`${match.path}${route.path}${child.path}`}
                        render={props => (
                            <child.component {...props} child={child} route={route} />
                        )} />
                ))
            }
        </Switch>
    )
}

class BasicLayout extends React.Component {
    rootSubmenuKeys = this.props.routes.map((route, idx) => idx.toString())

    state = {
        openKeys: [this.rootSubmenuKeys[0]],
        collapsed: false
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
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    logout = () => {
        axios.get('/user/logout')
        .then(res => {
            this.props.updateUser(null)
            this.props.history.push('/login')
        })
        .catch(err => {
            console.log(err)
        })
    }

    render() {
        const routes = this.props.routes
        const history = this.props.history
        const location = this.props.location
        const match = this.props.match

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
                    openKeys={this.state.openKeys}
                    onOpenChange={this.onOpenChange}
                >
                    {routes.map((route, idx) => {
                        if (route.routes) {
                            return (
                                <SubMenu
                                    key={idx}
                                    title={<span><Icon type={route.icon} style={{fontSize: 16}} /><span style={{fontSize: 14}}>{route.name}</span></span>}
                                >
                                    {
                                        route.routes.map((child, sn) => (
                                            <Menu.Item key={`${idx}-${sn}`}>
                                                <Link to={`${match.path}${route.path}${child.path}`}>{child.name}</Link>
                                            </Menu.Item>
                                        ))
                                    }
                                </SubMenu>
                            )
                        } else {
                            return (
                                <Menu.Item key={idx}>
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
                                <Avatar style={{ verticalAlign: 'middle' }} src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                <span className="ml-10">admin</span>
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
                                <SubRoute key={idx} route={route} idx={idx} match={match} />
                            )
                        } else {
                            return (
                                <Route
                                    key={idx}
                                    exact
                                    path={`${match.path}${route.path}`}
                                    render={props => (
                                        <route.component route={route} {...props} />
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

        return (
            <Layout
                style={{ minHeight: '100vh' }}
                className="BasicLayout"
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
