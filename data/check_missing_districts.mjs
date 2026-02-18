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

// 统计缺少区县或街道的城市
const missingInfo = {
  missingDistricts: [], // 缺少区县的城市
  missingStreets: []    // 有区县但缺少街道的城市
};

// 遍历所有省份
addressData.forEach(province => {
  // 遍历所有城市
  province.children.forEach(city => {
    const hasDistricts = city.children && city.children.length > 0;
    
    if (!hasDistricts) {
      missingInfo.missingDistricts.push({
        province: province.label,
        city: city.label,
        cityValue: city.value
      });
    } else {
      // 检查是否所有区县都有街道信息
      const hasStreets = city.children.some(district => 
        district.children && district.children.length > 0
      );
      
      if (!hasStreets) {
        missingInfo.missingStreets.push({
          province: province.label,
          city: city.label,
          cityValue: city.value,
          districtCount: city.children.length
        });
      }
    }
  });
});

// 输出结果
console.log('=== 缺少区县信息的城市 ===');
console.log(`总数: ${missingInfo.missingDistricts.length}个城市`);
missingInfo.missingDistricts.forEach(item => {
  console.log(`${item.province} - ${item.city} (${item.cityValue})`);
});

console.log('\n=== 有区县但缺少街道信息的城市 ===');
console.log(`总数: ${missingInfo.missingStreets.length}个城市`);
missingInfo.missingStreets.forEach(item => {
  console.log(`${item.province} - ${item.city} (${item.cityValue}) - ${item.districtCount}个区县`);
});

// 保存结果到文件
const resultPath = path.join(__dirname, 'missing_districts_report.txt');
fs.writeFileSync(resultPath, JSON.stringify(missingInfo, null, 2), 'utf8');
console.log(`\n结果已保存到: ${resultPath}`);