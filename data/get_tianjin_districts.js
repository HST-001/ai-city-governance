import fs from 'fs';
import path from 'path';

// 读取addressData.ts文件
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
const addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

// 解析addressData
const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据');
  process.exit(1);
}

const addressData = JSON.parse(jsonMatch[1].trim());

// 查找天津市
const tianjin = addressData.find(p => p.label === '天津市');
if (!tianjin || !tianjin.children) {
  console.error('未找到天津市数据');
  process.exit(1);
}

console.log('=== 天津市区县列表 ===\n');

// 输出所有区县及其value
let index = 1;
tianjin.children.forEach(district => {
  console.log(`${index++}. ${district.label} (value: ${district.value})`);
});

console.log(`\n共 ${tianjin.children.length} 个区县`);
