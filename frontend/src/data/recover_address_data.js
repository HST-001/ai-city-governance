// recover_address_data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 文件路径设置
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const BACKUP_FILE_PATH = path.join(PROJECT_ROOT, 'addressData_backup_1767006725424.ts');
const OUTPUT_FILE_PATH = path.join(__dirname, 'recovered_address_data.ts');

console.log('开始恢复地址数据...');

// 读取备份文件
let backupData;
try {
  backupData = fs.readFileSync(BACKUP_FILE_PATH, 'utf8');
  console.log(`成功读取备份文件: ${BACKUP_FILE_PATH}`);
} catch (error) {
  console.error(`无法读取备份文件: ${error.message}`);
  process.exit(1);
}

// 提取数据数组内容
function extractDataArray(content) {
  // 匹配从 const completeAddressData = [ 到 ] 的内容
  const regex = /const\s+completeAddressData\s*=\s*(\[.*?\]);/s;
  const match = content.match(regex);
  
  if (!match || !match[1]) {
    throw new Error('无法从备份文件中提取地址数据数组');
  }
  
  return match[1];
}

// 解析并格式化数据
let dataArray;
try {
  dataArray = extractDataArray(backupData);
  console.log('成功提取地址数据数组');
  
  // 构建输出文件内容
  const outputContent = `// 完整的中国地址数据（从备份恢复）
// 包含34个省级行政区的完整城市和区县信息

const completeAddressData = ${dataArray};

export default completeAddressData;
`;
  
  // 写入恢复后的数据文件
  fs.writeFileSync(OUTPUT_FILE_PATH, outputContent, 'utf8');
  console.log(`成功生成恢复后的数据文件: ${OUTPUT_FILE_PATH}`);
  
} catch (error) {
  console.error(`数据处理失败: ${error.message}`);
  process.exit(1);
}

console.log('地址数据恢复完成！');
