import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取addressData.ts文件
const filePath = join(__dirname, 'addressData.ts');
const fileContent = readFileSync(filePath, 'utf8');

// 移除TypeScript语法，只保留JSON数据部分
const jsonContent = fileContent
  .replace(/^const completeAddressData = /, '')
  .replace(/;\s*export default completeAddressData;\s*$/, '')
  .trim();

// 解析为JavaScript对象
const addressData = JSON.parse(jsonContent);

// 检查天津市西青区
console.log('检查天津市西青区：');
const tianjin = addressData.find(p => p.label === '天津市');
if (tianjin) {
  const xiqing = tianjin.children.find(d => d.label === '西青区');
  if (xiqing) {
    console.log(`找到西青区，value: ${xiqing.value}`);
    console.log(`街道数量: ${xiqing.children ? xiqing.children.length : 0}`);
  } else {
    console.log('未找到西青区');
  }
} else {
  console.log('未找到天津市');
}

// 检查重庆市万盛经开区
console.log('\n检查重庆市万盛经开区：');
const chongqing = addressData.find(p => p.label === '重庆市');
if (chongqing) {
  const wansheng = chongqing.children.find(d => d.label.includes('万盛'));
  if (wansheng) {
    console.log(`找到万盛经开区，value: ${wansheng.value}`);
    console.log(`街道数量: ${wansheng.children ? wansheng.children.length : 0}`);
  } else {
    console.log('未找到万盛经开区');
    console.log('重庆市区县列表：');
    chongqing.children.forEach(d => {
      console.log(`- ${d.label} (${d.value})`);
    });
  }
} else {
  console.log('未找到重庆市');
}

console.log('\n检查完成！');