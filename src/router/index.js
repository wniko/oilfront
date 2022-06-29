import {
	createRouter,
	createWebHashHistory
}
from 'vue-router'
import Login from '../views/login.vue'
import Main from "../views/main.vue"
import Home from "../views/home.vue"
import NotFound from "../views/404.vue"
import UserInfo from "../views/user_info.vue"
import Account from "../views/account.vue"
import BusinessInfo from "../views/businessInfo.vue"
import Quotation from "../views/quotation.vue"
import ShareOrder from "../views/shareOrder.vue"
import InquiryMarket from "../views/inquiryMarket.vue"
import FinishDeal from "../views/finishDeal.vue"
import User from "../views/user.vue"

const routes = [{
		path: '/login',
		name: 'Login',
		component: Login
	},
	{
		path: '/',
		name: 'Main',
		component: Main,
		children: [{
				path: '/home',
				name: 'Home',
				component: Home,
				meta: {
					title: '首页',
				}
			},
			{
				path: '/account',
				name: 'Account',
				component: Account,
				meta: {
					title: '用户管理',
					isTab: true
				}
			},
			{
				path: '/user',
				name: 'User',
				component: User,
				meta: {
					title: '用户',
					isTab: true
				}
			},
			{
				path: '/user_info',
				name: 'UserInfo',
				component: UserInfo,
				meta: {
					title: '用户',
					isTab: true
				}
			},
			{
				path: '/BusinessInfo',
				name: 'BusinessInfo',
				component: BusinessInfo,
				meta: {
					title: '企业',
					isTab: true
				}
			},
			{
				path: '/quotation',
				name: 'Quotation',
				component: Quotation,
				meta: {
					title: '报价',
					isTab: true
				}
			},
			{
				path: '/shareOrder',
				name: 'ShareOrder',
				component: ShareOrder,
				meta: {
					title: '拼单',
					isTab: true
				}
			},
			{
				path: '/inquiryMarket',
				name: 'InquiryMarket',
				component: InquiryMarket,
				meta: {
					title: '询单',
					isTab: true
				}
			},
			{
				path: '/finishDeal',
				name: 'FinishDeal',
				component: FinishDeal,
				meta: {
					title: '热点',
					isTab: true
				}
			}
		]
	},
	{
		path: "/404",
		name: "NotFound",
		component: NotFound
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: "/404"
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})
router.beforeEach((to, from, next) => {
	if (to.name != "Login") {
		let permissions = localStorage.getItem("permissions")
		if (permissions == null || permissions == "") {
			next({
				name: 'Login'
			})
		}
	}
	return next()
})

export default router
