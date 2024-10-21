/*
 * @Author: ShawnPhang
 * @Date: 2024-04-05 07:31:45
 * @Description:  
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2024-08-12 05:30:15
 */
// const prefix = import.meta.env
const prefix = process.env

const isDev = prefix.NODE_ENV === 'development'
import { version } from '../package.json'

export default {
  isDev,
  BASE_URL: isDev ? '/' : './',
  VERSION: version,
  APP_NAME: '迅排设计',
  COPYRIGHT: 'ShawnPhang - Design.pPalxp.cn',
  API_URL: isDev ? 'http://localhost:7001' : '', // 后端地址
  SCREEN_URL: isDev ? 'http://localhost:7001' : '', // 截图服务地址
  IMG_URL: 'https://store.palxp.cn/', // 七牛云资源地址
  // ICONFONT_URL: '//at.alicdn.com/t/font_3223711_74mlzj4jdue.css',
  ICONFONT_URL: '//at.alicdn.com/t/font_2717063_ypy8vprc3b.css?display=swap',
  ICONFONT_EXTRA: '//at.alicdn.com/t/c/font_3228074_xojoer6zhp.css',
  QINIUYUN_PLUGIN: 'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/qiniu-js/2.5.5/qiniu.min.js',
  supportSubFont: false, // 是否开启服务端字体压缩
}

export const LocalStorageKey = {
  tokenKey: "xp_token"
}
