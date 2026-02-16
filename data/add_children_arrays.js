// add_children_arrays.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 文件路径设置
const RECOVERED_FILE_PATH = path.join(__dirname, 'recovered_address_data.ts');
const OUTPUT_FILE_PATH = path.join(__dirname, 'complete_address_data_with_children.ts');

console.log('开始为所有区县添加children数组...');

// 读取恢复后的数据文件
let recoveredData;
try {
  recoveredData = fs.readFileSync(RECOVERED_FILE_PATH, 'utf8');
  console.log(`成功读取恢复后的数据文件: ${RECOVERED_FILE_PATH}`);
} catch (error) {
  console.error(`无法读取恢复后的数据文件: ${error.message}`);
  process.exit(1);
}

// 提取数据数组内容
function extractDataArray(content) {
  // 匹配从 const completeAddressData = [ 到 ] 的内容
  const regex = /const\s+completeAddressData\s*=\s*(\[.*?\]);/s;
  const match = content.match(regex);
  
  if (!match || !match[1]) {
    throw new Error('无法从数据文件中提取地址数据数组');
  }
  
  return match[1];
}

// 为所有区县添加children数组
function addChildrenToAllDistricts(dataArrayString) {
  // 解析数据数组
  let data;
  try {
    // 使用Function构造器安全解析
    data = new Function(`return ${dataArrayString}`)();
  } catch (error) {
    throw new Error(`数据解析失败: ${error.message}`);
  }
  
  // 递归为所有区县添加children数组
  function processProvince(province) {
    // 确保省份有children数组
    if (!province.children || !Array.isArray(province.children)) {
      province.children = [];
    }
    
    // 处理每个城市
    province.children.forEach(city => {
      // 确保城市有children数组
      if (!city.children || !Array.isArray(city.children)) {
        city.children = [];
      }
      
      // 处理每个区县
      city.children.forEach(district => {
        // 如果区县没有children属性或不是数组，添加空数组
        if (!district.children || !Array.isArray(district.children)) {
          district.children = [];
        }
      });
    });
    
    return province;
  }
  
  // 处理所有省份
  const processedData = data.map(processProvince);
  
  return processedData;
}

// 执行处理
try {
  const dataArrayString = extractDataArray(recoveredData);
  const processedData = addChildrenToAllDistricts(dataArrayString);
  
  // 将处理后的数据转换为字符串并构建输出文件内容
  const processedDataString = JSON.stringify(processedData, null, 2);
  
  const outputContent = `// 完整的中国地址数据（已添加children数组）
// 包含34个省级行政区的完整城市和区县信息，所有区县都已添加空的children数组

const completeAddressData = ${processedDataString};

export default completeAddressData;
`;
  
  // 写入处理后的数据文件
  fs.writeFileSync(OUTPUT_FILE_PATH, outputContent, 'utf8');
  console.log(`成功生成处理后的数据文件: ${OUTPUT_FILE_PATH}`);
  
  // 统计处理情况
  let provinceCount = processedData.length;
  let cityCount = 0;
  let districtCount = 0;
  
  processedData.forEach(province => {
    cityCount += province.children.length;
    province.children.forEach(city => {
      districtCount += city.children.length;
    });
  });
  
  console.log(`\n处理统计：`);
  console.log(`- 省份/直辖市/自治区数量: ${provinceCount}`);
  console.log(`- 城市数量: ${cityCount}`);
  console.log(`- 区县数量: ${districtCount}`);
  console.log(`- 所有区县已添加空的children数组`);
  
} catch (error) {
  console.error(`数据处理失败: ${error.message}`);
  process.exit(1);
}

console.log('\n为区县添加children数组完成！');