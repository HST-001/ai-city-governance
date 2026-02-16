import fs from 'fs';
import path from 'path';

// 读取文件内容
const filePath = path.join(process.cwd(), 'complete_district_data.mjs');
const fileContent = fs.readFileSync(filePath, 'utf8');

// 提取officialDistrictData对象的内容
const startIndex = fileContent.indexOf('const officialDistrictData = {');
const endIndex = fileContent.indexOf('};', startIndex) + 2;
const dataStr = fileContent.substring(startIndex, endIndex);

// 替换const关键字为export，然后执行
const exportStr = dataStr.replace('const officialDistrictData = {', 'export const officialDistrictData = {');

// 写入临时文件
fs.writeFileSync('temp_data.mjs', exportStr);

// 导入临时文件
import('./temp_data.mjs').then((module) => {
  const { officialDistrictData } = module;
  
  // 统计城市数量和列表
  const cities = Object.keys(officialDistrictData);
  console.log('Total cities with district data:', cities.length);
  console.log('Cities list:', cities);
  
  // 删除临时文件
  fs.unlinkSync('temp_data.mjs');
}).catch((error) => {
  console.error('Error:', error);
  // 确保删除临时文件
  try {
    fs.unlinkSync('temp_data.mjs');
  } catch (e) {
    // 忽略错误
  }
});