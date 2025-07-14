## tmdb-proxy

这是一个利用Netlify Functions代理tmdb接口和图片的仓库。

完全免费，但是每月有100GB流量限制，自用的话是完全够用的。

## 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/imaliang/tmdb-proxy)

## 使用方法

1. 部署。部署有两种方法：
    + 一是直接点击上方按钮一键部署到Netlify。
    + 二是先fork本项目，再登录 [Netlify](https://netlify.com/) 选择自己的仓库新建。

2. 绑定自己的域名(建议，因为自带的域名netlify.app在某些地区可能访问不稳定) 
    + 如果你没有域名，可以去 [腾讯云活动域名](https://curl.qcloud.com/ScJY3Hev) 注册一个，新用户1元1年。

3. 你自己绑定的域名就是tmdb的代理域名，会代理 api.themoviedb.org 和 image.tmdb.org

## API使用示例

1. API代理：
   ```
   https://你的域名/3/movie/popular?api_key=你的API密钥
   ```

2. 图片代理（方式1 - 直接重定向）：
   ```
   https://你的域名/t/p/w500/图片路径.jpg
   ```

3. 图片代理（方式2 - 通过函数处理）：
   ```
   https://你的域名/image/w500/图片路径.jpg
   ```

> **提示：** 两种图片代理方式的区别：
> - 方式1（/t/p/）：直接重定向到TMDB图片服务器，速度更快，但可能受到TMDB的地区限制
> - 方式2（/image/）：通过Netlify函数处理，可以绕过某些地区限制，但可能速度稍慢

## 本地开发

1. 安装依赖：
   ```
   npm install
   ```

2. 本地运行：
   ```
   npm run dev
   ```

## 感谢

[本项目 CDN 加速及安全防护由 Tencent EdgeOne 赞助](https://edgeone.ai/zh?from=github)

<a href="https://edgeone.ai/zh?from=github">
  <img src="https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png" width="400" alt="Tencent EdgeOne">
</a>
