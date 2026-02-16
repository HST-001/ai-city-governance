import fs from 'fs';
import path from 'path';

// 读取现有的地址数据
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
const addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

// 解析地址数据
const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据');
  process.exit(1);
}

const addressData = JSON.parse(jsonMatch[1].trim());

// 关键问题地区列表
const keyAreas = [
  { province: '北京市', district: '丰台区', check: ['xx乡', 'xx地区'] },
  { province: '北京市', district: '海淀区', check: ['xx地区'] },
  { province: '北京市', district: '房山区', check: ['xx市', 'xx县'] },
  { province: '天津市', district: '津南区', check: ['无街道信息'] },
  { province: '上海市', district: '闸北区', check: ['无街道信息'] },
  { province: '上海市', district: '虹口区', check: ['显示崇明区'] },
  { province: '重庆市', district: '江津区', check: ['xx区'] },
  { province: '重庆市', district: '万州区', check: ['显示丰都县'] },
  { province: '重庆市', district: '大渡口区', check: ['无街道信息'] }
];

console.log('=== 关键地区街道信息检查 ===\n');

// 检查关键地区
keyAreas.forEach(area => {
  // 查找省份
  const province = addressData.find(p => p.label === area.province);
  if (!province || !province.children) {
    console.log(`${area.province} - ${area.district}: ❌ 未找到省份数据`);
    return;
  }
  
  // 查找区县
  const district = province.children.find(d => d.label === area.district);
  if (!district) {
    console.log(`${area.province} - ${area.district}: ❌ 未找到区县数据`);
    return;
  }
  
  const hasStreets = district.children && district.children.length > 0;
  
  if (!hasStreets) {
    console.log(`${area.province} - ${area.district}: ⚠️  无街道信息 (value: ${district.value})`);
  } else {
    console.log(`${area.province} - ${area.district}: ✅ 有${district.children.length}个街道 (value: ${district.value})`);
    
    // 检查前3个街道示例
    const streetExamples = district.children.slice(0, 3).map(s => s.label);
    console.log(`   街道示例: ${streetExamples.join(', ')}${district.children.length > 3 ? '...' : ''}`);
    
    // 检查是否有错误街道名称
    const hasInvalidStreets = district.children.some(street => {
      return street.label.includes('xx') || street.label.includes('市') || street.label.includes('区') || street.label.includes('县') || street.label.includes('地区');
    });
    
    if (hasInvalidStreets) {
      console.log(`   ⚠️  存在格式错误的街道名称`);
    }
  }
  
  console.log('');
});

console.log('=== 检查完成 ===');