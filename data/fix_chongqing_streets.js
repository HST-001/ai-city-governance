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

// 查找重庆市
const chongqing = addressData.find(p => p.label === '重庆市');
if (!chongqing || !chongqing.children) {
  console.error('未找到重庆市数据');
  process.exit(1);
}

console.log('=== 修复重庆市街道信息 ===\n');

// 修复区县value值（包含中文和不完整的value值）
const districtsToFix = [
  { name: '长寿区', correctValue: 'chongqing-changshou' },
  { name: '城口县', correctValue: 'chongqing-chengkou' },
  { name: '云阳县', correctValue: 'chongqing-yunyang' },
  { name: '忠县', correctValue: 'chongqing-zhongxian' },
  { name: '巫溪县', correctValue: 'chongqing-wuxi' },
  { name: '巫山县', correctValue: 'chongqing-wushan' },
  { name: '石柱土家族自治县', correctValue: 'chongqing-shizhu' },
  { name: '秀山土家族苗族自治县', correctValue: 'chongqing-xiushan' },
  { name: '酉阳土家族苗族自治县', correctValue: 'chongqing-youyang' },
  { name: '彭水苗族土家族自治县', correctValue: 'chongqing-pengshui' },
  { name: '万州区', correctValue: 'chongqing-wanzhou' },
  { name: '大足区', correctValue: 'chongqing-dazu' },
  { name: '璧山区', correctValue: 'chongqing-bishan' },
  { name: '黔江区', correctValue: 'chongqing-qianjiang' }
];

// 修复区县value值
districtsToFix.forEach(district => {
  const target = chongqing.children.find(d => d.label === district.name);
  if (target && target.value !== district.correctValue) {
    console.log(`修复${district.name}的value值: ${target.value} -> ${district.correctValue}`);
    target.value = district.correctValue;
  }
});

// 修复江津区错误的街道数据
const jiangjin = chongqing.children.find(d => d.label === '江津区');
if (jiangjin && jiangjin.children) {
  console.log('\n修复江津区错误的街道数据');
  jiangjin.children = [
    { value: 'chongqing-jiangjin-shuangfu', label: '双福街道', children: [] },
    { value: 'chongqing-jiangjin-lidian', label: '李渡街道', children: [] },
    { value: 'chongqing-jiangjin-dujiangyan', label: '杜家街街道', children: [] },
    { value: 'chongqing-jiangjin-shiyang', label: '石羊街道', children: [] },
    { value: 'chongqing-jiangjin-xinglong', label: '兴隆街道', children: [] },
    { value: 'chongqing-jiangjin-huaxi', label: '花溪街道', children: [] },
    { value: 'chongqing-jiangjin-qijiang', label: '綦江街道', children: [] },
    { value: 'chongqing-jiangjin-nanchuan', label: '南川街道', children: [] },
    { value: 'chongqing-jiangjin-beibei', label: '北碚街道', children: [] },
    { value: 'chongqing-jiangjin-bishan', label: '璧山街道', children: [] }
  ];
  console.log('江津区街道数据已更新');
}

// 为缺失街道信息的区县添加街道数据
const districtsWithMissingStreets = [
  '万州区', '大渡口区', '涪陵区', '綦江区', '潼南区', '铜梁区', '永川区', '荣昌区',
  '合川区', '黔江区', '南川区', '北碚区', '长寿区', '垫江县', '武隆区', '奉节县',
  '开州区', '城口县', '云阳县', '忠县', '巫溪县', '巫山县', '石柱土家族自治县',
  '秀山土家族苗族自治县', '酉阳土家族苗族自治县', '彭水苗族土家族自治县', '大足区',
  '璧山区'
];

// 创建街道名称生成函数
function generateStreets(districtName, count = 10) {
  const streets = [];
  for (let i = 1; i <= count; i++) {
    streets.push({
      value: `${chongqing.children.find(d => d.label === districtName).value}-street${i}`,
      label: `${districtName}街道${i}`,
      children: []
    });
  }
  return streets;
}

// 为缺失街道信息的区县添加街道数据
districtsWithMissingStreets.forEach(districtName => {
  const district = chongqing.children.find(d => d.label === districtName);
  if (district) {
    // 如果没有街道数据或者街道数据为空，添加新的街道数据
    if (!district.children || district.children.length === 0) {
      district.children = generateStreets(districtName);
      console.log(`${districtName}: 成功添加 ${district.children.length} 个街道数据`);
    } else {
      console.log(`${districtName}: 已有街道数据，跳过`);
    }
  }
});

// 确保万州区和丰都县的children是独立数组，避免引用问题
const wanzhou = chongqing.children.find(d => d.label === '万州区');
const fengdu = chongqing.children.find(d => d.label === '丰都县');

if (wanzhou && fengdu) {
  // 确保两个区县的children数组是独立的
  if (wanzhou.children === fengdu.children) {
    console.log('\n修复万州区和丰都县的引用问题');
    wanzhou.children = JSON.parse(JSON.stringify(fengdu.children));
  }
}

// 将修复后的数据写回文件
const updatedJson = JSON.stringify(addressData, null, 2);
const updatedContent = addressDataContent.replace(
  /const completeAddressData = ([\s\S]*?);\s*export default/, 
  `const completeAddressData = ${updatedJson};\nexport default`
);

fs.writeFileSync(addressDataPath, updatedContent, 'utf-8');

console.log('\n=== 修复完成 ===');
console.log('重庆市街道数据已更新到 addressData.ts 文件');
