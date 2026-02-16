import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取addressData.ts文件
const filePath = join(__dirname, 'addressData.ts');
const fileContent = readFileSync(filePath, 'utf8');

// 移除TypeScript语法，只保留JSON数据部分
const jsonContent = fileContent
  .replace(/^const completeAddressData = /, '')
  .replace(/;\s*export default completeAddressData;\s*$/, '')
  .trim();

// 解析为JavaScript对象
const addressData = JSON.parse(jsonContent);

// 定义需要检查的地区
const areasToCheck = [
  { name: '北京市崇文区', province: '北京市', city: '北京市', district: '崇文区' },
  { name: '天津市河西区', province: '天津市', city: '天津市', district: '河西区' },
  { name: '上海市嘉定区', province: '上海市', city: '上海市', district: '嘉定区' },
  { name: '重庆市南岸区', province: '重庆市', city: '重庆市', district: '南岸区' },
  { name: '天津市红桥区', province: '天津市', city: '天津市', district: '红桥区' },
  { name: '天津市东丽区', province: '天津市', city: '天津市', district: '东丽区' },
  { name: '重庆市万盛经开区', province: '重庆市', city: '重庆市', district: '万盛经开区' },
  { name: '天津市西青区', province: '天津市', city: '天津市', district: '西青区' },
  { name: '上海市青浦区', province: '上海市', city: '上海市', district: '青浦区' },
  { name: '上海市闵行区', province: '上海市', city: '上海市', district: '闵行区' },
  { name: '上海市松江区', province: '上海市', city: '上海市', district: '松江区' }
];

console.log('检查以下地区的街道信息：');
console.log('------------------------------');

areasToCheck.forEach(area => {
  // 查找省份
  const province = addressData.find(p => p.label === area.province);
  if (!province) {
    console.log(`${area.name}: 未找到省份 ${area.province}`);
    return;
  }

  // 查找城市
  const city = province.children.find(c => c.label === area.city);
  if (!city) {
    console.log(`${area.name}: 未找到城市 ${area.city}`);
    return;
  }

  // 查找区县
  const district = city.children.find(d => d.label === area.district);
  if (!district) {
    console.log(`${area.name}: 未找到区县 ${area.district}`);
    return;
  }

  // 检查街道信息
  const streets = district.children || [];
  const streetCount = streets.length;

  // 检查河西区是否有无锡街道
  if (area.district === '河西区') {
    const hasWuxi = streets.some(s => s.label.includes('无锡') || s.value.includes('无锡'));
    console.log(`${area.name}: 找到 ${streetCount} 个街道 ${hasWuxi ? '(包含无锡街道 - 错误！)' : '(无无锡街道 - 正确)'}`);
  } else {
    console.log(`${area.name}: 找到 ${streetCount} 个街道`);
  }

  // 如果是河西区，显示所有街道名称
  if (area.district === '河西区') {
    console.log('  街道列表：');
    streets.forEach(street => {
      console.log(`    - ${street.label} (${street.value})`);
    });
  }
});

console.log('\n检查完成！');