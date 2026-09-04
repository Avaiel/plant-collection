# 植物收藏网站 · 部署说明

## 文件结构
```
index.html                              网站本体
netlify/functions/generate-description.js   AI 简介生成的后端接口
```
部署时把这两部分一起放进同一个仓库/文件夹，`netlify/functions` 是 Netlify 识别函数的默认路径，不用额外配置。

## 部署步骤

1. **拿一个 Gemini API key**
   打开 https://aistudio.google.com/apikey ，登录 Google 账号，创建一个 key，复制下来。

2. **把这两个文件推到 GitHub 仓库**，或者直接把整个文件夹拖进 Netlify 的部署面板。

3. **在 Netlify 后台配置环境变量**
   进入 Site settings → Environment variables → 新增一条：
   - Key: `GEMINI_API_KEY`
   - Value: 刚才复制的那个 key

4. **重新部署一次**（改环境变量后要触发一次新的部署才会生效）。

5. 打开部署好的网址，添加一株植物、上传照片、点击"AI 生成简介"试试看。

## 说明
- 图片和植物数据存在浏览器本地（localStorage），换设备或清缓存会丢失，记得用页面上的"导出备份"定期保存。
- Gemini API 免费额度有限，如果生成失败，也可能是当天额度用完了，隔天再试。
