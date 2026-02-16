// 简单测试脚本，验证addressData.ts文件能否正确使用
import fs from 'fs';
import path from 'path';

// 读取addressData.ts文件
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
const addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

// 解析JSON数据部分
const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据');
  process.exit(1);
}

const jsonString = jsonMatch[1].trim();
let addressData;
try {
  addressData = JSON.parse(jsonString);
  console.log('✅ addressData.ts文件解析成功');
  console.log(`共包含 ${addressData.length} 个省份/地区`);
  
  // 检查直辖市和特别行政区的街道信息
  const municipalities = ['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区'];
  
  municipalities.forEach(cityName => {
    const city = addressData.find(item => item.label === cityName);
    if (city && city.children) {
      console.log(`\n📍 ${cityName} 包含 ${city.children.length} 个区县`);
      
      // 检查前3个区县是否有街道信息
      const sampleDistricts = city.children.slice(0, 3);
      sampleDistricts.forEach(district => {
        if (district.children && district.children.length > 0) {
          console.log(`   - ${district.label}: ${district.children.length} 个街道`);
        } else {
          console.log(`   - ${district.label}: 无街道信息`);
        }
      });
    }
  });
  
  console.log('\n✅ 测试完成，addressData.ts文件可以正常使用');
  
} catch (error) {
  console.error('❌ JSON解析失败:', error.message);
  process.exit(1);
}
