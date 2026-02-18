// validate_address_data.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 文件路径设置
const DATA_FILE_PATH = path.join(__dirname, 'complete_address_data_with_children.ts');

console.log('开始验证地址数据完整性...');

// 读取数据文件
let dataFileContent;
try {
  dataFileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
  console.log(`成功读取数据文件: ${DATA_FILE_PATH}`);
} catch (error) {
  console.error(`无法读取数据文件: ${error.message}`);
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

// 验证数据结构完整性
function validateDataIntegrity(dataArrayString) {
  let data;
  try {
    // 使用Function构造器安全解析
    data = new Function(`return ${dataArrayString}`)();
  } catch (error) {
    throw new Error(`数据解析失败: ${error.message}`);
  }
  
  // 验证省份数量是否为34个
  console.log(`\n1. 验证省份数量：`);
  const expectedProvinceCount = 34;
  const actualProvinceCount = data.length;
  
  if (actualProvinceCount !== expectedProvinceCount) {
    console.error(`❌ 错误：省份数量不正确！期望: ${expectedProvinceCount}, 实际: ${actualProvinceCount}`);
  } else {
    console.log(`✅ 成功：省份数量正确，共${actualProvinceCount}个省级行政区`);
  }
  
  // 验证数据结构
  console.log(`\n2. 验证数据结构完整性：`);
  let hasErrors = false;
  let provinceWithIssues = [];
  
  data.forEach((province, index) => {
    // 验证省份属性
    if (!province.value || !province.label) {
      console.error(`❌ 错误：省份[${index}]缺少必要属性(value或label)`);
      provinceWithIssues.push(`省份[${index}]`);
      hasErrors = true;
    }
    
    // 验证省份是否有children数组
    if (!province.children || !Array.isArray(province.children)) {
      console.error(`❌ 错误：省份[${province.label || index}]缺少children数组`);
      provinceWithIssues.push(province.label || `省份[${index}]`);
      hasErrors = true;
    } else {
      // 验证城市
      province.children.forEach((city, cityIndex) => {
        // 验证城市属性
        if (!city.value || !city.label) {
          console.error(`❌ 错误：${province.label}下的城市[${cityIndex}]缺少必要属性(value或label)`);
          provinceWithIssues.push(province.label);
          hasErrors = true;
        }
        
        // 验证城市是否有children数组
        if (!city.children || !Array.isArray(city.children)) {
          console.error(`❌ 错误：${province.label}下的城市[${city.label || cityIndex}]缺少children数组`);
          provinceWithIssues.push(province.label);
          hasErrors = true;
        } else {
          // 验证区县
          city.children.forEach((district, districtIndex) => {
            // 验证区县属性
            if (!district.value || !district.label) {
              console.error(`❌ 错误：${province.label} - ${city.label}下的区县[${districtIndex}]缺少必要属性(value或label)`);
              provinceWithIssues.push(province.label);
              hasErrors = true;
            }
            
            // 验证区县是否有children数组
            if (!district.children || !Array.isArray(district.children)) {
              console.error(`❌ 错误：${province.label} - ${city.label}下的区县[${district.label || districtIndex}]缺少children数组`);
              provinceWithIssues.push(province.label);
              hasErrors = true;
            }
          });
        }
      });
    }
  });
  
  // 显示验证结果
  if (hasErrors) {
    console.log(`\n❌ 数据结构验证失败！`);
    console.log(`问题省份: ${[...new Set(provinceWithIssues)].join(', ')}`);
  } else {
    console.log(`✅ 成功：所有数据项都包含必要属性，且所有层级都包含children数组`);
  }
  
  // 统计信息
  console.log(`\n3. 统计信息：`);
  let totalCityCount = 0;
  let totalDistrictCount = 0;
  
  data.forEach(province => {
    const cityCount = province.children ? province.children.length : 0;
    totalCityCount += cityCount;
    
    if (province.children) {
      province.children.forEach(city => {
        if (city.children) {
          totalDistrictCount += city.children.length;
        }
      });
    }
  });
  
  console.log(`- 省份/直辖市/自治区: ${actualProvinceCount}个`);
  console.log(`- 城市/地区: ${totalCityCount}个`);
  console.log(`- 区县/县级市/区: ${totalDistrictCount}个`);
  
  // 列出所有省份
  console.log(`\n4. 省份列表：`);
  data.forEach((province, index) => {
    console.log(`${index + 1}. ${province.label}`);
  });
  
  return !hasErrors && actualProvinceCount === expectedProvinceCount;
}

// 执行验证
try {
  const dataArrayString = extractDataArray(dataFileContent);
  const isValid = validateDataIntegrity(dataArrayString);
  
  console.log(`\n===== 验证结果摘要 =====`);
  if (isValid) {
    console.log(`✅ 数据完整性验证通过！数据结构完整，包含全部${34}个省份。`);
  } else {
    console.log(`❌ 数据完整性验证失败！请检查上述错误信息。`);
    process.exit(1);
  }
  
} catch (error) {
  console.error(`验证失败: ${error.message}`);
  process.exit(1);
}

console.log(`\n地址数据完整性验证完成！`);