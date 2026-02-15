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

// 查找上海市
const shanghai = addressData.find(p => p.label === '上海市');
if (!shanghai || !shanghai.children) {
  console.error('未找到上海市数据');
  process.exit(1);
}

console.log('=== 上海市区县列表 ===\n');

// 输出所有区县及其value和街道数量
let index = 1;
shanghai.children.forEach(district => {
  const streetCount = district.children ? district.children.length : 0;
  console.log(`${index++}. ${district.label} (value: ${district.value}) - ${streetCount}个街道`);
  
  // 显示前3个街道示例
  if (streetCount > 0) {
    const examples = district.children.slice(0, 3).map(s => s.label).join(', ');
    console.log(`   街道示例: ${examples}${streetCount > 3 ? '...' : ''}`);
  }
});

console.log(`\n共 ${shanghai.children.length} 个区县`);
