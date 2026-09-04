# 植物收藏网站 · 部署说明

## 文件结构
```
index.html                                 网站本体
package.json                               声明依赖（@netlify/blobs）
netlify/functions/plants.js                读写植物数据（存在 Netlify Blobs 里，云端持久存储）
netlify/functions/generate-description.js  AI 简介生成（调用 Gemini）
```
部署时把这些文件放进同一个仓库/文件夹，`netlify/functions` 是 Netlify 识别函数的默认路径，`package.json` 让 Netlify 在部署时自动装好依赖，都不用额外配置。

## 数据存在哪里
植物数据不再存浏览器本地，而是存进 **Netlify Blobs**——这是 Netlify 自带的云端存储，跟着这个网站自动开通，不用另外注册账号或配置密钥。换设备、清缓存都不会丢数据，页面顶部会显示"已同步到云端存储"。
浏览器本地仍然会留一份缓存（主要用于云端连不上时应急查看），但云端 Blobs 才是真正的数据来源。

## 部署步骤

1. **在 GitHub 建仓库，把这些文件推上去**（本地打开这个文件夹依次执行）：
   ```
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin 你的仓库地址
   git push -u origin main
   ```

2. **登录 Netlify**（app.netlify.com，用 GitHub 账号登录即可关联），点 "Add new site" → "Import an existing project" → "Deploy with GitHub"，选中这个仓库。

3. **确认部署配置**：Build command 留空，Publish directory 填 `.`，点 "Deploy site"。Netlify Blobs 会随网站自动开通，不需要单独配置。

4. **拿一个 Gemini API key**（如果要用 AI 生成简介）：打开 https://aistudio.google.com/apikey，登录 Google 账号，创建一个 key。

5. **在 Netlify 后台配置环境变量**：Site configuration → Environment variables → 新增 `GEMINI_API_KEY`，值填刚才那串 key。

6. **重新触发一次部署**（改环境变量后要 Trigger deploy 才会生效）。

7. 打开部署好的网址，添加一株植物、上传照片，看页面顶部是否显示"已同步到云端存储"，再试试"AI 生成简介"。

## 说明
- 页面顶部的状态提示会告诉你当前是"已同步到云端"还是"未连接云端"（比如本地直接打开文件时后者是正常现象，部署上线后应该显示已同步）。
- 仍然建议偶尔用"导出备份"存一份 JSON 到本地，多一层保险。
- Gemini API 免费额度有限，生成失败也可能是当天额度用完，隔天再试。
