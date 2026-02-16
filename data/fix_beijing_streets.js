import fs from 'fs';
import path from 'path';

// 读取addressData.ts文件
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
let addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

// 解析addressData
const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据');
  process.exit(1);
}

let addressData = JSON.parse(jsonMatch[1].trim());

// 查找北京市
const beijing = addressData.find(p => p.label === '北京市');
if (!beijing || !beijing.children) {
  console.error('未找到北京市数据');
  process.exit(1);
}

// 问题区县列表
const problemDistricts = ['丰台区', '海淀区', '房山区'];

console.log('=== 修复北京市街道信息错误 ===\n');

// 修复街道数据的函数
function fixStreetData(district) {
  if (!district || !district.children) return;
  
  let fixCount = 0;
  
  district.children.forEach(street => {
    let originalLabel = street.label;
    let originalValue = street.value;
    
    // 修复规则
    let changed = false;
    
    // 移除"xx"占位符
    if (street.label.includes('xx')) {
      street.label = street.label.replace('xx', '');
      changed = true;
    }
    
    // 移除"地区"后缀
    if (street.label.endsWith('地区')) {
      street.label = street.label.replace(/地区$/, '');
      changed = true;
    }
    
    // 移除"市"后缀
    if (street.label.endsWith('市')) {
      street.label = street.label.replace(/市$/, '');
      changed = true;
    }
    
    // 移除"县"后缀
    if (street.label.endsWith('县')) {
      street.label = street.label.replace(/县$/, '');
      changed = true;
    }
    
    // 移除"区"后缀
    if (street.label.endsWith('区')) {
      street.label = street.label.replace(/区$/, '');
      changed = true;
    }
    
    // 如果街道名称有变化，更新对应的value
    if (changed) {
      // 提取区县value部分
      const districtValue = originalValue.match(/^(.*?)-[^-]+$/)[1];
      // 生成新的街道value
      street.value = `${districtValue}-${street.label}`;
      fixCount++;
      
      console.log(`  修复: ${originalLabel} -> ${street.label}`);
    }
  });
  
  return fixCount;
}

// 修复所有问题区县
problemDistricts.forEach(districtName => {
  const district = beijing.children.find(d => d.label === districtName);
  if (!district) {
    console.log(`${districtName}: 未找到区县数据`);
    return;
  }
  
  console.log(`【${districtName}】`);
  console.log(`现有街道数: ${district.children ? district.children.length : 0}`);
  
  const fixCount = fixStreetData(district);
  
  if (fixCount > 0) {
    console.log(`修复完成: 共修复了 ${fixCount} 个街道名称错误\n`);
  } else {
    console.log(`无需修复: 未发现街道名称错误\n`);
  }
});

// 将修复后的数据写回文件
const updatedJson = JSON.stringify(addressData, null, 2);
const updatedContent = addressDataContent.replace(
  /const completeAddressData = ([\s\S]*?);\s*export default/, 
  `const completeAddressData = ${updatedJson};\nexport default`
);

fs.writeFileSync(addressDataPath, updatedContent, 'utf-8');

console.log('=== 修复完成 ===');
console.log('地址数据已更新到 addressData.ts 文件');