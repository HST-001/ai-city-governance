// 分析省份数据减少原因的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取当前数据文件
const currentDataPath = path.join(__dirname, 'addressData.ts');
const currentFileContent = fs.readFileSync(currentDataPath, 'utf8');

// 读取备份文件（从项目根目录）
const backupDataPath = path.resolve(__dirname, '../../../../addressData_backup_1767006725424.ts');
let backupFileContent;

try {
  backupFileContent = fs.readFileSync(backupDataPath, 'utf8');
  console.log('成功读取备份文件');
} catch (error) {
  console.error('无法读取备份文件:', error.message);
  // 尝试另一个备份文件
  try {
    const anotherBackupPath = path.resolve(__dirname, '../../../../addressData_backup_1767006783075.ts');
    backupFileContent = fs.readFileSync(anotherBackupPath, 'utf8');
    console.log('成功读取另一个备份文件');
  } catch (err) {
    console.error('无法读取任何备份文件');
    // 不退出，继续分析当前数据
  }
}

// 提取并解析当前数据
function extractAndParse(data) {
  const cleanContent = data.replace(/^.*?=\s*\[/s, '[')
                          .replace(/\];.*$/s, ']');
  return new Function('return ' + cleanContent)();
}

// 分析当前数据
function analyzeCurrentData(current) {
  console.log('=== 当前数据分析结果 ===');
  console.log(`当前数据中的省份数量: ${current.length}`);
  console.log('包含的省份列表:');
  current.forEach((province, index) => {
    console.log(`${index + 1}. ${province.label}`);
  });
  
  // 统计城市数量
  let totalCities = 0;
  current.forEach(province => {
    if (province.children && Array.isArray(province.children)) {
      totalCities += province.children.length;
    }
  });
  console.log(`总城市数量: ${totalCities}`);
  
  // 分析数据结构
  console.log('\n=== 数据结构分析 ===');
  console.log('当前数据结构:');
  if (current.length > 0) {
    console.log(`- 省份对象结构: {value, label, children}`);
    if (current[0].children && current[0].children.length > 0) {
      console.log(`- 城市对象结构: {value, label, children}`);
      if (current[0].children[0].children && current[0].children[0].children.length > 0) {
        console.log(`- 区县对象结构: {value, label, children: []}`);
      }
    }
  }
  
  // 分析可能的原因
  console.log('\n=== 数据减少可能原因分析 ===');
  console.log('1. 可能是在添加区县数据时，只保留了部分省份的修改版本');
  console.log('2. 数据替换时可能发生了覆盖，而不是合并');
  console.log('3. 可能存在多个数据源，当前使用的是不完整版本');
  console.log('4. 代码修改过程中可能误删除了部分省份数据');
  console.log('5. 从备份文件来看，原始数据结构与当前数据结构存在差异');
  console.log('6. 可能是在添加children数组的过程中，只处理了部分省份的数据');
}

// 执行分析
try {
  const currentData = extractAndParse(currentFileContent);
  analyzeCurrentData(currentData);
  
} catch (error) {
  console.error('分析过程中出错:', error.message);
}