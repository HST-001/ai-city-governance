import fs from 'fs';
import path from 'path';

// 读取并直接解析文件
const addressDataPath = path.join(import.meta.dirname, 'addressData.ts');
let fileContent = fs.readFileSync(addressDataPath, 'utf8');

// 移除TypeScript语法
fileContent = fileContent.replace('const completeAddressData = ', '');
fileContent = fileContent.replace('export default completeAddressData;', '');

let addressData;
try {
  addressData = JSON.parse(fileContent);
  console.log('✅ 文件解析成功');
  console.log(`共包含 ${addressData.length} 个省份/地区`);
} catch (error) {
  console.error('❌ 文件解析失败:', error.message);
  process.exit(1);
}

// 检查街道信息
const missingStreets = [];
const suspiciousStreets = [];

addressData.forEach(province => {
  if (!province.children) return;
  
  province.children.forEach(city => {
    if (!city.children) return;
    
    city.children.forEach(district => {
      // 检查是否有街道信息
      if (!district.children || district.children.length === 0) {
        missingStreets.push({
          province: province.label,
          city: city.label,
          district: district.label
        });
        return;
      }
      
      // 检查街道名称是否合理
      const hasInvalidName = district.children.some(street => {
        return !street.label || !/街道|镇|乡/.test(street.label);
      });
      
      if (hasInvalidName) {
        suspiciousStreets.push({
          province: province.label,
          city: city.label,
          district: district.label,
          streetCount: district.children.length
        });
      }
    });
  });
});

// 输出结果
console.log('\n=== 街道信息检查结果 ===');
console.log(`\n❌ 缺失街道信息的区县: ${missingStreets.length} 个`);
missingStreets.forEach(item => {
  console.log(`- ${item.province} - ${item.city} - ${item.district}`);
});

console.log(`\n⚠️  街道信息可疑的区县: ${suspiciousStreets.length} 个`);
if (suspiciousStreets.length > 0) {
  console.log('(街道名称不包含"街道"、"镇"或"乡"等关键词)');
  suspiciousStreets.forEach(item => {
    console.log(`- ${item.province} - ${item.city} - ${item.district} (${item.streetCount}个街道)`);
  });
}

console.log('\n=== 检查完成 ===');