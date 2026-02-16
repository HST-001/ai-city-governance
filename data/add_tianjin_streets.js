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

// 查找天津市
const tianjin = addressData.find(p => p.label === '天津市');
if (!tianjin || !tianjin.children) {
  console.error('未找到天津市数据');
  process.exit(1);
}

// 用户提到的缺失街道信息的区县
const missingDistricts = [
  { name: '津南区', value: 'tianjin-nanhe', streets: ['咸水沽镇', '葛沽镇', '小站镇', '双港镇', '辛庄镇', '双桥河镇', '八里台镇', '北闸口镇', '双新街', '津南经济开发区'] },
  { name: '武清区', value: 'tianjin-wuqing', streets: ['杨村街道', '下朱庄街道', '东蒲洼街道', '黄庄街道', '徐官屯街道', '豆张庄街道', '梅厂镇', '大碱厂镇', '崔黄口镇', '大良镇'] },
  { name: '宝坻区', value: 'tianjin-宝坻区', streets: ['宝平街道', '海滨街道', '钰华街道', '周良街道', '大白庄镇', '口东镇', '王卜庄镇', '方家庄镇', '林亭口镇', '八门城镇'] },
  { name: '静海区', value: 'tianjin-静海区', streets: ['静海镇', '唐官屯镇', '独流镇', '王口镇', '台头镇', '子牙镇', '陈官屯镇', '中旺镇', '大邱庄镇', '蔡公庄镇'] },
  { name: '宁河区', value: 'tianjin-ninghe', streets: ['芦台街道', '宁河街道', '潘庄镇', '造甲城镇', '七里海镇', '大北涧沽镇', '板桥镇', '苗庄镇', '岳龙镇', '丰台镇'] },
  { name: '蓟州区', value: 'tianjin-蓟州区', streets: ['文昌街道', '渔阳镇', '洇溜镇', '官庄镇', '马伸桥镇', '下营镇', '邦均镇', '别山镇', '尤古庄镇', '上仓镇'] },
  { name: '滨海新区', value: 'tianjin-', streets: ['塘沽街道', '汉沽街道', '大港街道', '泰达街道', '新城镇', '杭州道街道', '新河街道', '大沽街道', '北塘街道', '胡家园街道'] }
];

console.log('=== 添加天津市缺失的街道信息 ===\n');

missingDistricts.forEach(district => {
  // 查找区县
  const targetDistrict = tianjin.children.find(d => d.label === district.name);
  if (!targetDistrict) {
    console.log(`${district.name}: 未找到区县数据`);
    return;
  }
  
  // 如果已有街道数据，跳过
  if (targetDistrict.children && targetDistrict.children.length > 0) {
    console.log(`${district.name}: 已有街道数据，跳过`);
    return;
  }
  
  // 创建街道数据
  const streets = district.streets.map(streetName => {
    // 生成街道value（使用区县value作为前缀）
    const districtValue = targetDistrict.value || district.value;
    // 确保街道value格式正确
    let streetValue;
    if (districtValue && !districtValue.endsWith('-')) {
      streetValue = `${districtValue}-${streetName}`;
    } else {
      streetValue = `tianjin-${district.name.toLowerCase()}-${streetName}`;
    }
    
    return {
      value: streetValue,
      label: streetName,
      children: []
    };
  });
  
  // 添加街道数据
  targetDistrict.children = streets;
  
  console.log(`${district.name}: 成功添加 ${streets.length} 个街道数据`);
  console.log(`  街道示例: ${streets.slice(0, 3).map(s => s.label).join(', ')}...`);
});

// 修复滨海新区的value值（当前是空的）
const binhai = tianjin.children.find(d => d.label === '滨海新区');
if (binhai && binhai.value === 'tianjin-') {
  binhai.value = 'tianjin-binhai';
  console.log('\n修复了滨海新区的value值: tianjin- -> tianjin-binhai');
}

// 将修复后的数据写回文件
const updatedJson = JSON.stringify(addressData, null, 2);
const updatedContent = addressDataContent.replace(
  /const completeAddressData = ([\s\S]*?);\s*export default/, 
  `const completeAddressData = ${updatedJson};\nexport default`
);

fs.writeFileSync(addressDataPath, updatedContent, 'utf-8');

console.log('\n=== 完成 ===');
console.log('天津市街道数据已更新到 addressData.ts 文件');
