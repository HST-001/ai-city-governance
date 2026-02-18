// 简单的地址数据验证脚本 (ES模块版本)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取地址数据文件
const filePath = path.join(__dirname, 'addressData.ts');
let fileContent;
try {
  fileContent = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  console.error('无法读取文件:', error.message);
  process.exit(1);
}

// 提取数据部分，移除TypeScript语法
let dataString = fileContent.replace(/^.*?const\s+completeAddressData\s*=\s*(\[.*?\]);.*$/s, '$1');
dataString = dataString.replace(/export\s+default\s+completeAddressData;\s*$/, '');

// 解析为JavaScript对象
let addressData;
try {
  // 使用Function构造器代替eval，更安全
  const parseData = new Function(`return ${dataString}`);
  addressData = parseData();
} catch (error) {
  console.error('解析数据失败:', error.message);
  process.exit(1);
}

// 验证函数
function validateAddressData(data, parentPath = '') {
  let isValid = true;
  let missingChildren = [];
  
  function validateLevel(items, currentPath) {
    if (!Array.isArray(items)) return;
    
    items.forEach(item => {
      // 检查每个项是否有必要的属性
      if (!item.value || !item.label) {
        isValid = false;
        console.error(`${currentPath} - 缺少必要属性:`, item);
        return;
      }
      
      // 检查children属性
      if (!Array.isArray(item.children)) {
        isValid = false;
        missingChildren.push(`${currentPath}${item.label}`);
        // 记录但不修复，我们只做验证
      }
      
      // 如果有子项，递归验证
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        validateLevel(item.children, `${currentPath}${item.label} -> `);
      }
    });
  }
  
  validateLevel(data, '');
  
  // 输出验证结果
  if (missingChildren.length > 0) {
    console.log(`找到 ${missingChildren.length} 个缺少children数组的项:`);
    missingChildren.forEach(item => console.log(`  - ${item}`));
    isValid = false;
  } else {
    console.log('✓ 所有项都包含正确的children数组!');
  }
  
  return isValid;
}

// 执行验证
console.log('开始验证地址数据...');
const validationResult = validateAddressData(addressData);

// 统计数据
let totalProvinces = 0;
let totalCities = 0;
let totalDistricts = 0;

addressData.forEach(province => {
  totalProvinces++;
  
  if (province.children && Array.isArray(province.children)) {
    totalCities += province.children.length;
    
    province.children.forEach(city => {
      if (city.children && Array.isArray(city.children)) {
        totalDistricts += city.children.length;
      }
    });
  }
});

console.log(`\n统计信息:`);
console.log(`- 省份/直辖市/自治区总数: ${totalProvinces}`);
console.log(`- 城市总数: ${totalCities}`);
console.log(`- 区县总数: ${totalDistricts}`);

// 根据验证结果设置退出码
process.exit(validationResult ? 0 : 1);