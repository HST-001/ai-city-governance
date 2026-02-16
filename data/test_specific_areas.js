// 创建一个简单的测试脚本，直接检查addressData.ts文件的内容
import fs from 'fs';
import path from 'path';

// 读取文件内容
const addressDataPath = path.join(import.meta.dirname, 'addressData.ts');
const content = fs.readFileSync(addressDataPath, 'utf8');

console.log('=== 重点地区街道信息检查 ===\n');

// 检查北京市崇文区
console.log('📍 北京市崇文区');
const chongwenRegex = /"value":"beijing-chongwen","label":"崇文区","children":\[([^\]]*)\]/;
const chongwenMatch = content.match(chongwenRegex);
if (chongwenMatch) {
  const streets = chongwenMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
  console.log(`   街道示例: ${streets.substring(0, 100)}...`);
} else {
  console.log('   ❌ 未找到崇文区信息');
}

// 检查天津市河西区
console.log('\n📍 天津市河西区');
const hexiRegex = /"value":"tianjin-hexi","label":"河西区","children":\[([^\]]*)\]/;
const hexiMatch = content.match(hexiRegex);
if (hexiMatch) {
  const streets = hexiMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
  console.log(`   街道示例: ${streets.substring(0, 100)}...`);
  
  // 检查是否还包含无锡的街道
  if (streets.includes('无锡')) {
    console.log('   ❌ 仍包含错误的无锡街道信息');
  } else {
    console.log('   ✅ 已修正，不再包含无锡街道信息');
  }
} else {
  console.log('   ❌ 未找到河西区信息');
}

// 检查上海市嘉定区
console.log('\n📍 上海市嘉定区');
const jiadingRegex = /"value":"shanghai-jiading","label":"嘉定区","children":\[([^\]]*)\]/;
const jiadingMatch = content.match(jiadingRegex);
if (jiadingMatch) {
  const streets = jiadingMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到嘉定区信息');
}

// 检查重庆市南岸区
console.log('\n📍 重庆市南岸区');
const nananRegex = /"value":"chongqing-nanan","label":"南岸区","children":\[([^\]]*)\]/;
const nananMatch = content.match(nananRegex);
if (nananMatch) {
  const streets = nananMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到南岸区信息');
}

// 检查天津市红桥区
console.log('\n📍 天津市红桥区');
const hongqiaoRegex = /"value":"tianjin-hongqiao","label":"红桥区","children":\[([^\]]*)\]/;
const hongqiaoMatch = content.match(hongqiaoRegex);
if (hongqiaoMatch) {
  const streets = hongqiaoMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到红桥区信息');
}

// 检查天津市东丽区
console.log('\n📍 天津市东丽区');
const dongliRegex = /"value":"tianjin-dongli","label":"东丽区","children":\[([^\]]*)\]/;
const dongliMatch = content.match(dongliRegex);
if (dongliMatch) {
  const streets = dongliMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到东丽区信息');
}

// 检查重庆市万盛经开区
console.log('\n📍 重庆市万盛经开区');
const wanshengRegex = /"value":"chongqing-wansheng","label":"万盛经开区","children":\[([^\]]*)\]/;
const wanshengMatch = content.match(wanshengRegex);
if (wanshengMatch) {
  const streets = wanshengMatch[1];
  const streetCount = (streets.match(/\{"value"/g) || []).length;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到万盛经开区信息');
}

console.log('\n=== 检查完成 ===');