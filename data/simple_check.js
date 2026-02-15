import fs from 'fs';
import path from 'path';

// 读取文件内容
const addressDataPath = path.join(import.meta.dirname, 'addressData.ts');
const content = fs.readFileSync(addressDataPath, 'utf8');

console.log('=== 街道信息简单检查 ===\n');

// 检查北京市崇文区
console.log('📍 北京市崇文区');
if (content.includes('beijing-chongwen')) {
  console.log('   ✅ 存在崇文区信息');
  // 计算街道数量
  const start = content.indexOf('"value":"beijing-chongwen"');
  const end = content.indexOf('],', start) + 1;
  const chongwenContent = content.substring(start, end);
  const streetCount = (chongwenContent.match(/\{"value"/g) || []).length - 1; // 减1是因为包含区县本身
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到崇文区信息');
}

// 检查天津市河西区
console.log('\n📍 天津市河西区');
if (content.includes('tianjin-hexi')) {
  console.log('   ✅ 存在河西区信息');
  // 检查是否还包含无锡的街道
  if (content.includes('无锡')) {
    console.log('   ❌ 仍包含错误的无锡街道信息');
  } else {
    console.log('   ✅ 已修正，不再包含无锡街道信息');
  }
} else {
  console.log('   ❌ 未找到河西区信息');
}

// 检查天津市红桥区
console.log('\n📍 天津市红桥区');
if (content.includes('tianjin-hongqiao')) {
  console.log('   ✅ 存在红桥区信息');
  const start = content.indexOf('"value":"tianjin-hongqiao"');
  const end = content.indexOf('],', start) + 1;
  const hongqiaoContent = content.substring(start, end);
  const streetCount = (hongqiaoContent.match(/\{"value"/g) || []).length - 1;
  console.log(`   街道数量: ${streetCount}`);
} else {
  console.log('   ❌ 未找到红桥区信息');
}

// 检查天津市东丽区
console.log('\n📍 天津市东丽区');
if (content.includes('tianjin-dongli')) {
  console.log('   ✅ 存在东丽区信息');
} else {
  console.log('   ❌ 未找到东丽区信息');
}

// 检查天津市西青区
console.log('\n📍 天津市西青区');
if (content.includes('tianjin-xiqing')) {
  console.log('   ✅ 存在西青区信息');
} else {
  console.log('   ❌ 未找到西青区信息');
}

// 检查重庆市万盛经开区
console.log('\n📍 重庆市万盛经开区');
if (content.includes('chongqing-wansheng')) {
  console.log('   ✅ 存在万盛经开区信息');
} else {
  console.log('   ❌ 未找到万盛经开区信息');
}

// 检查上海市嘉定区
console.log('\n📍 上海市嘉定区');
if (content.includes('shanghai-jiading')) {
  console.log('   ✅ 存在嘉定区信息');
} else {
  console.log('   ❌ 未找到嘉定区信息');
}

// 检查上海市青浦区
console.log('\n📍 上海市青浦区');
if (content.includes('shanghai-qingpu')) {
  console.log('   ✅ 存在青浦区信息');
} else {
  console.log('   ❌ 未找到青浦区信息');
}

// 检查上海市闵行区
console.log('\n📍 上海市闵行区');
if (content.includes('shanghai-minhang')) {
  console.log('   ✅ 存在闵行区信息');
} else {
  console.log('   ❌ 未找到闵行区信息');
}

// 检查上海市松江区
console.log('\n📍 上海市松江区');
if (content.includes('shanghai-songjiang')) {
  console.log('   ✅ 存在松江区信息');
} else {
  console.log('   ❌ 未找到松江区信息');
}

console.log('\n=== 检查完成 ===');