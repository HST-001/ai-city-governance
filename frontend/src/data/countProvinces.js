// 统计省份数量的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取文件内容
const dataPath = path.join(__dirname, 'addressData.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

// 提取数组内容（移除TypeScript语法）
const cleanContent = fileContent.replace(/^.*?=\s*\[/s, '[')
                              .replace(/\];.*$/s, ']');

// 解析数据
let addressData;
try {
  // 使用Function构造器安全解析
  addressData = new Function('return ' + cleanContent)();
  
  console.log(`总省份/直辖市/自治区数量: ${addressData.length}`);
  console.log('包含的省份列表:');
  addressData.forEach((province, index) => {
    console.log(`${index + 1}. ${province.label}`);
  });
  
  // 统计城市数量
  let totalCities = 0;
  addressData.forEach(province => {
    if (province.children && Array.isArray(province.children)) {
      totalCities += province.children.length;
    }
  });
  console.log(`总城市数量: ${totalCities}`);
  
} catch (error) {
  console.error('解析数据时出错:', error.message);
}