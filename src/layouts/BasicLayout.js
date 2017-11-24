/**
 * 整体页面架构
 * @description
 * @author 吴燕萍
 * @date 2017/11/22
 */
import styles from './BasicLayout.less'
import React from 'react'
import { Layout, Menu, Breadcrumb, Icon } from 'antd'

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
                            <Content style={{ margin: '0 16px' }}>
                                <Breadcrumb style={{ margin: '16px 0' }}>
                                    <Breadcrumb.Item>{route.name}</Breadcrumb.Item>
                                    <Breadcrumb.Item>{child.name}</Breadcrumb.Item>
                                </Breadcrumb>
                                <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                                    <child.component />
                                </div>
                            </Content>
                        )} />
                ))
            }
        </Switch>
    )
}

class BasicLayout extends React.Component {
    rootSubmenuKeys = this.props.routes.map((route, idx) => idx.toString())

    state = {
        openKeys: [this.rootSubmenuKeys[0]]
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
    render() {
        const routes = this.props.routes
        const history = this.props.history
        const location = this.props.location
        const match = this.props.match

        const dynamicSider = (
            <div>
                <div className="logo" />
                <Menu theme="dark" mode="inline" openKeys={this.state.openKeys} onOpenChange={this.onOpenChange}>
                    {routes.map((route, idx) => {
                        if (route.routes) {
                            return (
                                <SubMenu
                                    key={idx}
                                    title={<span><Icon type={route.icon} /><span>{route.name}</span></span>}
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
                                    <Icon type={route.icon} />
                                    <span><Link to={`${match.path}${route.path}`}>{route.name}</Link></span>
                                </Menu.Item>
                            )
                        }
                    })}
                </Menu>
            </div>
        )

        const dynamicLayout = (
            <div>
                <Header style={{ background: '#fff', padding: 0 }} />
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
                                        <Content style={{ margin: '0 16px' }}>
                                            <Breadcrumb style={{ margin: '16px 0' }}>
                                                <Breadcrumb.Item>{route.name}</Breadcrumb.Item>
                                            </Breadcrumb>
                                            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                                                <route.component />
                                            </div>
                                        </Content>
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
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
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
