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

// 查找上海市
const shanghai = addressData.find(p => p.label === '上海市');
if (!shanghai || !shanghai.children) {
  console.error('未找到上海市数据');
  process.exit(1);
}

console.log('=== 修复上海市街道信息 ===\n');

// 修复区县value值
const districtsToFix = [
  { name: '虹口区', correctValue: 'shanghai-hongkou' },
  { name: '杨浦区', correctValue: 'shanghai-yangpu' },
  { name: '宝山区', correctValue: 'shanghai-baoshan' },
  { name: '奉贤区', correctValue: 'shanghai-fengxian' },
  { name: '崇明区', correctValue: 'shanghai-chongming' }
];

// 修复区县value值
districtsToFix.forEach(district => {
  const target = shanghai.children.find(d => d.label === district.name);
  if (target && target.value !== district.correctValue) {
    console.log(`修复${district.name}的value值: ${target.value} -> ${district.correctValue}`);
    target.value = district.correctValue;
  }
});

// 为缺失街道信息的区县添加街道数据
const streetsData = {
  '闸北区': ['北站街道', '宝山路街道', '共和新路街道', '大宁路街道', '彭浦新村街道', '临汾路街道', '芷江西路街道', '天目西路街道', '虬江路街道', '宝山路街道-2'],
  '虹口区': ['四川北路街道', '乍浦路街道', '欧阳路街道', '广中路街道', '曲阳路街道', '凉城新村街道', '嘉兴路街道', '提篮桥街道', '江湾镇街道', '北外滩街道'],
  '杨浦区': ['定海路街道', '平凉路街道', '江浦路街道', '四平路街道', '控江路街道', '长白新村街道', '延吉新村街道', '殷行街道', '大桥街道', '五角场街道'],
  '宝山区': ['友谊路街道', '吴淞街道', '张庙街道', '高境镇街道', '庙行镇街道', '罗店镇街道', '顾村镇街道', '大场镇街道', '杨行镇街道', '月浦镇街道'],
  '奉贤区': ['南桥镇街道', '奉城镇街道', '庄行镇街道', '金汇镇街道', '四团镇街道', '青村镇街道', '柘林镇街道', '海湾镇街道', '西渡街道', '奉浦街道'],
  '崇明区': ['城桥镇街道', '堡镇街道', '新河镇街道', '庙镇街道', '竖新镇街道', '向化镇街道', '三星镇街道', '港沿镇街道', '中兴镇街道', '陈家镇街道']
};

// 修复卢湾区错误的街道数据
const luwan = shanghai.children.find(d => d.label === '卢湾区');
if (luwan && luwan.children) {
  console.log('\n修复卢湾区错误的街道数据');
  luwan.children = [
    { value: 'shanghai-luwan-xintiandi', label: '新天地街道', children: [] },
    { value: 'shanghai-luwan-laoximen', label: '老西门街道', children: [] },
    { value: 'shanghai-luwan-rende', label: '打浦桥街道', children: [] },
    { value: 'shanghai-luwan-tianzifang', label: '田子坊街道', children: [] },
    { value: 'shanghai-luwan-huangpujiang', label: '黄浦江街道', children: [] }
  ];
  console.log('卢湾区街道数据已更新');
}

// 添加街道数据
Object.keys(streetsData).forEach(districtName => {
  const district = shanghai.children.find(d => d.label === districtName);
  if (!district) {
    console.log(`${districtName}: 未找到区县数据`);
    return;
  }
  
  // 如果已有街道数据，跳过
  if (district.children && district.children.length > 0) {
    console.log(`${districtName}: 已有街道数据，跳过`);
    return;
  }
  
  // 创建街道数据
  const streets = streetsData[districtName].map(streetName => {
    return {
      value: `${district.value}-${streetName}`,
      label: streetName,
      children: []
    };
  });
  
  // 添加街道数据
  district.children = streets;
  
  console.log(`${districtName}: 成功添加 ${streets.length} 个街道数据`);
});

// 将修复后的数据写回文件
const updatedJson = JSON.stringify(addressData, null, 2);
const updatedContent = addressDataContent.replace(
  /const completeAddressData = ([\s\S]*?);\s*export default/, 
  `const completeAddressData = ${updatedJson};\nexport default`
);

fs.writeFileSync(addressDataPath, updatedContent, 'utf-8');

console.log('\n=== 修复完成 ===');
console.log('上海市街道数据已更新到 addressData.ts 文件');
