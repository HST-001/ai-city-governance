import fs from 'fs';
import path from 'path';

// 读取addressData.ts文件
const addressDataPath = path.join(import.meta.dirname, 'addressData.ts');
const content = fs.readFileSync(addressDataPath, 'utf8');

// 提取addressData对象
const startIndex = content.indexOf('const completeAddressData = [');
if (startIndex === -1) {
  console.error('无法找到completeAddressData定义');
  process.exit(1);
}

const endIndex = content.indexOf('];', startIndex) + 2;
const addressDataStr = content.substring(startIndex + 26, endIndex);

// 转换为JavaScript对象
let addressData;
try {
  addressData = eval(`[${addressDataStr}]`);
} catch (error) {
  console.error('解析addressData失败:', error.message);
  process.exit(1);
}

// 检查街道信息完整性
console.log('=== 街道信息完整性检查 ===');
console.log('');

const missingStreets = [];
const suspiciousStreets = [];

addressData.forEach(province => {
  if (!province.children) return;
  
  console.log(`📍 ${province.label}`);
  
  province.children.forEach(city => {
    if (!city.children) return;
    
    city.children.forEach(district => {
      // 检查是否有children属性
      if (!district.children || district.children.length === 0) {
        missingStreets.push({
          province: province.label,
          city: city.label,
          district: district.label,
          value: district.value
        });
        return;
      }
      
      // 检查街道信息是否可疑
      const hasInvalidStreet = district.children.some(street => {
        // 检查街道是否有正确的label和value
        if (!street.label || !street.value) return true;
        
        // 检查街道的label是否包含"街道"或"镇"或"乡"
        if (!/街道|镇|乡/.test(street.label)) return true;
        
        return false;
      });
      
      if (hasInvalidStreet) {
        suspiciousStreets.push({
          province: province.label,
          city: city.label,
          district: district.label,
          value: district.value,
          streetCount: district.children.length
        });
      }
    });
  });
  
  console.log('');
});

// 输出结果
console.log('=== 检查结果汇总 ===');
console.log('');

if (missingStreets.length > 0) {
  console.log(`❌ 发现 ${missingStreets.length} 个区县缺失街道信息:`);
  missingStreets.forEach((item, index) => {
    console.log(`${index + 1}. ${item.province} - ${item.city} - ${item.district} (${item.value})`);
  });
  console.log('');
} else {
  console.log('✅ 所有区县都有街道信息');
  console.log('');
}

if (suspiciousStreets.length > 0) {
  console.log(`⚠️  发现 ${suspiciousStreets.length} 个区县可能存在街道信息错误:`);
  suspiciousStreets.forEach((item, index) => {
    console.log(`${index + 1}. ${item.province} - ${item.city} - ${item.district} (${item.value})，共 ${item.streetCount} 个街道`);
  });
} else {
  console.log('✅ 所有街道信息看起来正常');
}

console.log('');
console.log('=== 检查完成 ===');