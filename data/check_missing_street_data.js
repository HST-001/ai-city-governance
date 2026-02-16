import fs from 'fs';
import path from 'path';

// 读取complete_street_data.mjs文件，提取streetData
const streetDataPath = path.join(process.cwd(), 'complete_street_data.mjs');
const streetDataContent = fs.readFileSync(streetDataPath, 'utf-8');

// 提取streetData对象
const streetDataMatch = streetDataContent.match(/const streetData = ([\s\S]*?);\s*\/\/ 补全街道信息的函数/);
if (!streetDataMatch) {
  console.error('无法提取streetData数据');
  process.exit(1);
}

// 解析streetData
let streetData;
try {
  // 移除末尾的逗号（如果有）以确保JSON格式正确
  const cleanedStreetData = streetDataMatch[1].trim()
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');
  
  streetData = eval(`(${cleanedStreetData})`);
  console.log('成功解析streetData，共', Object.keys(streetData).length, '个区县的街道数据');
} catch (error) {
  console.error('解析streetData失败:', error.message);
  process.exit(1);
}

// 读取addressData.ts获取所有区县的value
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
const addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据');
  process.exit(1);
}

const addressData = JSON.parse(jsonMatch[1].trim());

// 用户提到的问题地区列表
const problemAreas = [
  // 北京市
  { province: '北京市', districts: ['丰台区', '海淀区', '房山区'] },
  // 天津市
  { province: '天津市', districts: ['津南区', '武清区', '宝坻区', '静海区', '宁河区', '蓟州区', '滨海新区'] },
  // 上海市
  { province: '上海市', districts: ['闸北区', '虹口区'] },
  // 重庆市
  { province: '重庆市', districts: ['大渡口区', '涪陵区', '綦江区', '潼南区', '铜梁区', '永川区', '荣昌区', '合川区', '黔江区', '南川区', '北碚区', '长寿区', '垫江区', '武隆区', '奉节县', '开州区', '城口县', '云阳县', '忠县', '巫溪县', '巫山县', '江津区', '万州区'] }
];

console.log('\n=== 缺失街道数据的问题地区 ===\n');

let missingCount = 0;
let hasDataCount = 0;

// 检查问题地区在streetData中的覆盖情况
problemAreas.forEach(area => {
  console.log(`【${area.province}】`);
  
  const province = addressData.find(p => p.label === area.province);
  if (!province || !province.children) return;
  
  area.districts.forEach(districtName => {
    const district = province.children.find(d => d.label === districtName);
    
    if (!district) {
      console.log(`  - ${districtName}: 未找到该区县数据`);
    } else {
      const hasStreetData = streetData[district.value] || 
                          streetData[district.value.replace(/\s+/g, '')];
      
      if (!hasStreetData) {
        console.log(`  - ${districtName}: 缺失街道数据 (value: ${district.value})`);
        missingCount++;
      } else {
        console.log(`  - ${districtName}: 已有街道数据 (value: ${district.value}, 共${hasStreetData.length}个街道)`);
        hasDataCount++;
      }
    }
  });
  
  console.log('');
});

console.log(`=== 检查结果统计 ===`);
console.log(`总问题地区数: ${missingCount + hasDataCount}`);
console.log(`已有的街道数据: ${hasDataCount}`);
console.log(`缺失的街道数据: ${missingCount}`);
