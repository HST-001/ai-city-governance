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

// 查找重庆市
const chongqing = addressData.find(p => p.label === '重庆市');
if (!chongqing || !chongqing.children) {
  console.error('未找到重庆市数据');
  process.exit(1);
}

console.log('=== 重庆市区县列表 ===\n');

// 输出所有区县及其value和街道数量
let index = 1;
chongqing.children.forEach(district => {
  const streetCount = district.children ? district.children.length : 0;
  console.log(`${index++}. ${district.label} (value: ${district.value}) - ${streetCount}个街道`);
  
  // 显示前3个街道示例（如果有）
  if (streetCount > 0) {
    const examples = district.children.slice(0, 3).map(s => s.label).join(', ');
    console.log(`   街道示例: ${examples}${streetCount > 3 ? '...' : ''}`);
    
    // 检查是否有格式错误的街道名称
    const hasInvalidStreets = district.children.some(street => 
      street.label.includes('xx') || 
      street.label.endsWith('区') || 
      street.label.endsWith('市') || 
      street.label.endsWith('县')
    );
    if (hasInvalidStreets) {
      console.log(`   ⚠️  存在格式错误的街道名称`);
    }
  }
});

console.log(`\n共 ${chongqing.children.length} 个区县`);
