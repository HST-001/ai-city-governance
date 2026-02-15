import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取addressData.ts文件
const addressDataPath = path.join(__dirname, 'addressData.ts');
const content = fs.readFileSync(addressDataPath, 'utf8');

// 提取JSON数据部分
const jsonContent = content.match(/\[\s*\{[\s\S]*\}\s*\]/)[0];
const addressData = JSON.parse(jsonContent);

// 统计信息
let totalCities = 0;
let missingDistrictsCount = 0;
let missingStreetsCount = 0;

// 按省份统计
const provinceStats = {};

// 遍历所有省份
addressData.forEach(province => {
  provinceStats[province.label] = {
    totalCities: province.children.length,
    missingDistricts: 0,
    missingStreets: 0
  };
  
  // 遍历所有城市
  province.children.forEach(city => {
    totalCities++;
    const hasDistricts = city.children && city.children.length > 0;
    
    if (!hasDistricts) {
      missingDistrictsCount++;
      provinceStats[province.label].missingDistricts++;
    } else {
      // 检查是否所有区县都有街道信息
      const hasStreets = city.children.some(district => 
        district.children && district.children.length > 0
      );
      
      if (!hasStreets) {
        missingStreetsCount++;
        provinceStats[province.label].missingStreets++;
      }
    }
  });
});

// 输出统计结果
console.log('=== 城市区县和街道信息缺失统计 ===');
console.log(`总城市数: ${totalCities}`);
console.log(`缺少区县信息的城市: ${missingDistrictsCount} (${((missingDistrictsCount/totalCities)*100).toFixed(2)}%)`);
console.log(`有区县但缺少街道信息的城市: ${missingStreetsCount} (${((missingStreetsCount/totalCities)*100).toFixed(2)}%)`);
console.log(`区县和街道信息完整的城市: ${totalCities - missingDistrictsCount - missingStreetsCount} (${(((totalCities - missingDistrictsCount - missingStreetsCount)/totalCities)*100).toFixed(2)}%)`);

console.log('\n=== 各省份缺失情况统计 ===');
Object.entries(provinceStats).forEach(([province, stats]) => {
  const missingDistrictsPercent = ((stats.missingDistricts/stats.totalCities)*100).toFixed(2);
  const missingStreetsPercent = ((stats.missingStreets/stats.totalCities)*100).toFixed(2);
  const completePercent = (((stats.totalCities - stats.missingDistricts - stats.missingStreets)/stats.totalCities)*100).toFixed(2);
  
  console.log(`${province}: 总城市${stats.totalCities}个`);
  console.log(`  - 缺少区县: ${stats.missingDistricts}个 (${missingDistrictsPercent}%)`);
  console.log(`  - 缺少街道: ${stats.missingStreets}个 (${missingStreetsPercent}%)`);
  console.log(`  - 信息完整: ${stats.totalCities - stats.missingDistricts - stats.missingStreets}个 (${completePercent}%)`);
});
