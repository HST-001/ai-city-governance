import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取addressData.ts文件
const filePath = join(__dirname, 'addressData.ts');
const fileContent = readFileSync(filePath, 'utf8');

// 定义需要检查的地区
const areasToCheck = [
  { name: '北京市崇文区', key: 'beijing-chongwen' },
  { name: '天津市河西区', key: 'tianjin-hexi' },
  { name: '上海市嘉定区', key: 'shanghai-jiading' },
  { name: '重庆市南岸区', key: 'chongqing-nanan' },
  { name: '天津市红桥区', key: 'tianjin-hongqiao' },
  { name: '天津市东丽区', key: 'tianjin-dongli' },
  { name: '重庆市万盛经开区', key: 'chongqing-wansheng' },
  { name: '天津市西青区', key: 'tianjin-xiqing' },
  { name: '上海市青浦区', key: 'shanghai-qingpu' },
  { name: '上海市闵行区', key: 'shanghai-minhang' },
  { name: '上海市松江区', key: 'shanghai-songjiang' }
];

console.log('检查以下地区的街道信息：');
console.log('------------------------------');

areasToCheck.forEach(area => {
  // 查找该地区的街道数据
  const districtRegex = new RegExp(`"value":"${area.key}-[^"]*"[\s\S]*?\]\s*,`, 'g');
  const matches = fileContent.match(districtRegex);
  
  if (matches) {
    // 计算街道数量
    const streetCount = matches.length;
    
    // 检查河西区是否有无锡街道
    if (area.key === 'tianjin-hexi') {
      const hasWuxi = fileContent.includes('tianjin-hexi-无锡');
      console.log(`${area.name}: 找到 ${streetCount} 个街道 ${hasWuxi ? '(包含无锡街道 - 错误！)' : '(无无锡街道 - 正确)'}`);
    } else {
      console.log(`${area.name}: 找到 ${streetCount} 个街道`);
    }
  } else {
    console.log(`${area.name}: 未找到信息`);
  }
});

// 检查河西区的街道信息（更详细的检查）
console.log('\n河西区街道详细检查：');
console.log('------------------------------');
const hexiRegex = new RegExp(`"value":"tianjin-hexi-[^"]*","label":"([^"]*)"`, 'g');
const hexiStreets = [];
let match;
while ((match = hexiRegex.exec(fileContent)) !== null) {
  hexiStreets.push(match[1]);
}

console.log('河西区所有街道：');
hexiStreets.forEach(street => {
  console.log(`- ${street}`);
});

console.log('\n检查完成！');