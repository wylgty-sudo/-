# 部署指南

## 前置条件

- GitHub 账号（用于连接 Vercel）
- Google 账号（用于登录）
- Supabase 账号（https://supabase.com，免费注册）
- Vercel 账号（https://vercel.com，用 GitHub 登录即可）

## 第一步：准备 Supabase

1. 登录 https://supabase.com，新建项目（选离你最近的区域，建议 Singapore）
2. 等待项目初始化完成（约 1 分钟）
3. 进入 **SQL Editor**，粘贴 `supabase/migrations/001_initial.sql` 全部内容，点击 Run
4. 进入 **Authentication → Providers → Google**，启用 Google 登录：
   - 前往 https://console.cloud.google.com 创建 OAuth 2.0 客户端
   - 将 Supabase 提供的 Callback URL 填入 Google 控制台的"已获授权的重定向 URI"
   - 将 Google 的 Client ID 和 Client Secret 填回 Supabase
5. 进入 **Project Settings → API**，记录：
   - Project URL（如 `https://abc.supabase.co`）
   - anon/public key
   - service_role key（保密！）
6. 进入 **Storage**，新建 bucket 名为 `materials`，设为 **Public**

## 第二步：推送代码到 GitHub

```bash
cd personal-assistant
git remote add origin https://github.com/你的用户名/personal-assistant.git
git push -u origin master
```

## 第三步：部署到 Vercel

1. 登录 https://vercel.com
2. 点击 **Add New → Project**，选择刚才推送的 GitHub 仓库
3. 在 **Environment Variables** 中添加以下变量：

| 变量名 | 值 |
|--------|----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `ADMIN_EMAIL` | 你的 Gmail 地址（如 abc@gmail.com） |
| `CRON_SECRET` | 任意随机字符串（如 my-secret-123）|

4. 点击 **Deploy**，等待约 2 分钟
5. 部署完成后，将 Vercel 提供的域名（如 `https://xxx.vercel.app`）填入 Supabase：
   - **Authentication → URL Configuration → Site URL**：填入你的 Vercel 域名
   - **Redirect URLs**：添加 `https://xxx.vercel.app/auth/callback`

## 第四步：首次登录

1. 打开 Vercel 提供的 URL
2. 点击"使用 Google 账号登录"
3. 选择你在 `ADMIN_EMAIL` 中填写的 Google 账号
4. 自动进入应用，你的账号已被设为管理员

## 添加朋友

1. 进入应用 → 点击侧边栏底部"设置"
2. 输入朋友的 Gmail 邮箱，点击"添加"
3. 朋友打开同一个 URL，用对应 Google 账号登录即可

## 手机添加到主屏幕（PWA）

**iPhone / Safari：**
1. 用 Safari 打开应用 URL
2. 点击底部分享按钮 → "添加到主屏幕"

**Android / Chrome：**
1. 用 Chrome 打开应用 URL
2. 点击右上角菜单 → "添加到主屏幕"

## 本地开发

```bash
cp .env.local.example .env.local
# 填写 .env.local 中的变量值（从 Supabase 项目设置获取）
npm run dev
```

访问 http://localhost:3000

## 常见问题

**登录后提示"暂无访问权限"**
- 确认登录邮箱在 Supabase `allowed_users` 表中，或与 `ADMIN_EMAIL` 环境变量一致

**图片上传失败**
- 确认 Supabase Storage 中已创建名为 `materials` 的 **Public** bucket

**顺延任务不工作**
- 确认 Vercel 项目设置中 `CRON_SECRET` 与 `vercel.json` 中一致
- 在 Vercel 控制台 → Functions → Cron Jobs 查看执行日志
