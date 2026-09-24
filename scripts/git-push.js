import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();
const repoUrl = 'https://github.com/lethikiman523-del/Nh-u-t-kpop-s-1.git';

const ignoreList = [
  'node_modules',
  'dist',
  '.git',
  'cloudflared',
  '.DS_Store',
  '*.log',
];

function isIgnored(relPath) {
  if (relPath.startsWith('node_modules') || relPath.startsWith('dist') || relPath.startsWith('.git')) return true;
  if (relPath === 'cloudflared' || relPath === '.DS_Store') return true;
  if (relPath.endsWith('.log')) return true;
  return false;
}

function getAllFiles(currentDir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(currentDir);
  for (const file of list) {
    const fullPath = path.join(currentDir, file);
    const relPath = baseDir ? `${baseDir}/${file}` : file;

    if (isIgnored(relPath)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function run() {
  console.log('📦 Khởi tạo Git repository...');
  await git.init({ fs, dir });

  console.log('🔗 Cấu hình Remote Origin:', repoUrl);
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });
  } catch (err) {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
    await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });
  }

  console.log('📂 Đang gom tất cả tệp nguồn dự án...');
  const files = getAllFiles(dir);
  for (const file of files) {
    await git.add({ fs, dir, filepath: file });
  }

  console.log('✍️ Tạo Commit Version 1.0...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'lethikiman523-del',
      email: 'lethikiman523@gmail.com',
    },
    message: 'v1.0.0 - Lưu trữ phiên bản 1.0 Nhà đầu tư IDOL K-POP số 1',
  });

  console.log('✅ Commit SHA thành công:', sha);

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  console.log('\n🚀 Đang đẩy (Push) mã nguồn lên GitHub:', repoUrl);

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => ({
        username: token ? 'x-access-token' : 'lethikiman523-del',
        password: token || '',
      }),
    });
    console.log('🎉 Đẩy mã nguồn Ver 1 lên GitHub THÀNH CÔNG!', pushResult);
  } catch (pushErr) {
    console.warn('⚠️ Push với Token mặc định gặp phản hồi:', pushErr.message);
    console.log('\n📌 Repository đã được Commit lưu trữ v1.0.0 sẵn sàng tại local!');
  }
}

run().catch((err) => {
  console.error('Lỗi khi chạy git script:', err);
});
