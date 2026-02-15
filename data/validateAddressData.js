// validateAddressData.js - 验证地址数据的完整性和准确性
import fs from 'fs';
import path from 'path';

// 使用最简单的相对路径
const filePath = './addressData.ts';

function validateAddressData() {
  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // 提取JavaScript数据部分
    const dataMatch = fileContent.match(/const completeAddressData = \[([\s\S]*?)\];/);
    if (!dataMatch) {
      console.error('无法从文件中提取addressData数据');
      return false;
    }
    
    // 构建可执行的JavaScript代码来解析数据
    const dataCode = `[${dataMatch[1]}]`;
    
    // 使用Function构造函数安全地解析数据
    const addressData = new Function(`return ${dataCode}`)();
    
    console.log('✓ 成功解析addressData数据');
    console.log(`总共找到 ${addressData.length} 个省级行政区`);
    
    // 统计和验证
    let totalCities = 0;
    let totalDistricts = 0;
    let validationErrors = [];
    
    // 验证省级数据
    addressData.forEach((province, provinceIndex) => {
      validateProvince(province, provinceIndex, validationErrors);
      
      // 统计城市数量
      if (province.children && Array.isArray(province.children)) {
        totalCities += province.children.length;
        
        // 验证每个城市
        province.children.forEach((city) => {
          const cityPath = `${province.label} > ${city.label}`;
          validateCity(city, cityPath, validationErrors);
          
          // 统计区县数量
          if (city.children && Array.isArray(city.children)) {
            totalDistricts += city.children.length;
            
            // 验证每个区县
            city.children.forEach((district) => {
              const districtPath = `${cityPath} > ${district.label}`;
              validateDistrict(district, districtPath, validationErrors);
            });
          }
        });
      }
    });
    
    console.log(`\n统计结果:`);
    console.log(`- 省级行政区: ${addressData.length}`);
    console.log(`- 城市/地区: ${totalCities}`);
    console.log(`- 区县/街道: ${totalDistricts}`);
    
    // 显示验证错误
    if (validationErrors.length > 0) {
      console.error(`\n发现 ${validationErrors.length} 个数据问题:`);
      validationErrors.forEach((error, index) => {
        console.error(`${index + 1}. ${error}`);
      });
      return false;
    } else {
      console.log('\n✓ 所有数据验证通过，未发现问题！');
      return true;
    }
    
  } catch (error) {
    console.error('验证过程中出现错误:', error.message);
    console.error('当前工作目录:', process.cwd());
    return false;
  }
}

// 验证省级数据
function validateProvince(province, index, errors) {
  if (!province.value || !province.label) {
    errors.push(`省级行政区[${index}]缺少必要的value或label属性`);
  }
  
  if (!province.children || !Array.isArray(province.children)) {
    errors.push(`[${province.label}]缺少children数组`);
  }
}

// 验证城市数据
function validateCity(city, path, errors) {
  if (!city.value || !city.label) {
    errors.push(`${path} 缺少必要的value或label属性`);
  }
  
  if (city.children === undefined) {
    errors.push(`${path} 没有定义children属性`);
  } else if (!Array.isArray(city.children)) {
    errors.push(`${path} 的children不是数组类型`);
  }
}

// 验证区县数据
function validateDistrict(district, path, errors) {
  if (!district.value || !district.label) {
    errors.push(`${path} 缺少必要的value或label属性`);
  }
  
  // 区县不应该有children属性或应为空数组
  if (district.children !== undefined && (!Array.isArray(district.children) || district.children.length > 0)) {
    errors.push(`${path} 不应该包含children或应为空数组`);
  }
}

// 执行验证并设置退出码
const result = validateAddressData();
process.exit(result ? 0 : 1);

