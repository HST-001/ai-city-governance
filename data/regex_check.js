import fs from 'fs';
import path from 'path';

// 读取文件内容
const addressDataPath = path.join(import.meta.dirname, 'addressData.ts');
const fileContent = fs.readFileSync(addressDataPath, 'utf8');

// 使用正则表达式查找所有区县
const districtRegex = /{"value":"([^"]+)","label":"([^"]+)","children":\[([^\]]*)\]}/g;
let match;
const districts = [];

while ((match = districtRegex.exec(fileContent)) !== null) {
  const [, value, label, children] = match;
  districts.push({
    value,
    label,
    children: children.trim()
  });
}

console.log(`共找到 ${districts.length} 个区县`);

// 检查街道信息
const missingStreets = [];
const suspiciousStreets = [];

// 提取省份和城市信息
const provinceRegex = /{"value":"([^"]+)","label":"([^"]+)","children":\[/g;
const provinceMatches = [];
let provinceMatch;

while ((provinceMatch = provinceRegex.exec(fileContent)) !== null) {
  provinceMatches.push(provinceMatch);
}

// 简化检查，直接查看每个区县的children内容
console.log('\n=== 街道信息快速检查 ===');
let checkCount = 0;

for (const district of districts) {
  checkCount++;
  
  // 检查是否有街道信息
  if (district.children === '') {
    console.log(`❌ ${district.label} (${district.value}): 无街道信息`);
    missingStreets.push(district);
  } else {
    // 检查街道数量
    const streetCount = (district.children.match(/\{"value"/g) || []).length;
    
    // 检查街道名称是否包含关键词
    const hasStreetKeywords = /街道|镇|乡/.test(district.children);
    
    if (!hasStreetKeywords) {
      console.log(`⚠️ ${district.label} (${district.value}): ${streetCount}个街道，名称可能不正确`);
      suspiciousStreets.push(district);
    }
  }
  
  // 只显示前50个结果
  if (checkCount >= 50) {
    console.log('... 结果过多，仅显示前50个');
    break;
  }
}

console.log(`\n=== 检查结果 ===`);
console.log(`缺失街道信息: ${missingStreets.length} 个`);
console.log(`街道信息可疑: ${suspiciousStreets.length} 个`);

// 重点检查之前问题较多的地区
console.log('\n=== 重点地区检查 ===');
const keyAreas = [
  'tianjin-hexi', // 天津河西区
  'shanghai-jiading', // 上海嘉定区
  'shanghai-qingpu', // 上海青浦区
  'chongqing-nanan', // 重庆南岸区
  'chongqing-banan' // 重庆巴南区
];

for (const area of keyAreas) {
  const district = districts.find(d => d.value.includes(area));
  if (district) {
    const streetCount = (district.children.match(/\{"value"/g) || []).length;
    const hasStreetKeywords = /街道|镇|乡/.test(district.children);
    
    console.log(`${district.label} (${district.value}): ${streetCount}个街道 ${hasStreetKeywords ? '✅' : '⚠️'}`);
  }
}