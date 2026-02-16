import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 验证脚本
function validateAddressData() {
  console.log('开始验证地址数据文件...');
  
  try {
    // 1. 检查文件是否存在
    const DATA_PATH = path.join(__dirname, 'addressData.ts');
    if (!fs.existsSync(DATA_PATH)) {
      throw new Error(`地址数据文件不存在: ${DATA_PATH}`);
    }
    console.log(`✅ 找到地址数据文件: ${path.basename(DATA_PATH)}`);
    
    // 2. 读取文件内容
    const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
    console.log(`✅ 成功读取文件内容，大小: ${fileContent.length} 字节`);
    
    // 3. 提取JavaScript数组内容
    const arrayMatch = fileContent.match(/const\s+\w+\s*=\s*(\[.*?\]);/s);
    if (!arrayMatch || !arrayMatch[1]) {
      throw new Error('无法从文件中提取数据数组');
    }
    
    // 4. 解析JSON数据
    let addressData;
    try {
      addressData = JSON.parse(arrayMatch[1]);
      console.log(`✅ 成功解析数据数组`);
    } catch (parseError) {
      throw new Error(`数据解析失败: ${parseError.message}`);
    }
    
    // 5. 验证省级行政区数量
    console.log(`\n📊 数据统计:`);
    console.log(`  - 省级行政区数量: ${addressData.length}`);
    
    if (addressData.length !== 34) {
      console.log(`❌ 省级行政区数量错误！应为34个，实际有${addressData.length}个`);
      return false;
    } else {
      console.log(`✅ 省级行政区数量正确: 34个`);
    }
    
    // 6. 验证所有节点都有必要的字段和children数组
    let totalCities = 0;
    let totalDistricts = 0;
    let allValid = true;
    
    console.log('\n🔍 结构验证:');
    
    function validateNode(node, path = '') {
      // 检查必要字段
      if (!node.value || !node.label) {
        console.log(`❌ 节点缺少必要字段: ${path}`);
        allValid = false;
      }
      
      // 检查是否有children数组
      if (!Array.isArray(node.children)) {
        console.log(`❌ 节点没有children数组: ${path}`);
        allValid = false;
        node.children = [];
      }
      
      // 递归验证子节点
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const childPath = path ? `${path} > ${child.label}` : child.label;
          validateNode(child, childPath);
        }
      }
    }
    
    // 递归计算城市和区县数量
    function countNodes(data, level = 0) {
      for (const node of data) {
        if (level === 1) {
          totalCities++;
        } else if (level === 2) {
          totalDistricts++;
        }
        
        if (node.children && node.children.length > 0) {
          countNodes(node.children, level + 1);
        }
      }
    }
    
    // 执行验证和统计
    addressData.forEach((province, index) => {
      validateNode(province, `[${index}] ${province.label}`);
    });
    countNodes(addressData);
    
    // 输出统计结果
    console.log(`  - 总城市数量: ${totalCities}`);
    console.log(`  - 总区县数量: ${totalDistricts}`);
    
    // 7. 检查所有区县是否都有children数组
    let districtsWithoutChildren = 0;
    
    function checkAllDistrictsHaveChildren(data, level = 0) {
      for (const node of data) {
        // 如果是区县级别或叶子节点，确保有children数组
        if ((level === 2 || !node.children || node.children.length === 0) && !Array.isArray(node.children)) {
          districtsWithoutChildren++;
        }
        
        if (node.children && node.children.length > 0) {
          checkAllDistrictsHaveChildren(node.children, level + 1);
        }
      }
    }
    
    checkAllDistrictsHaveChildren(addressData);
    
    if (districtsWithoutChildren === 0) {
      console.log(`✅ 所有区县都有children数组`);
    } else {
      console.log(`❌ 有${districtsWithoutChildren}个区县没有children数组`);
      allValid = false;
    }
    
    // 8. 输出验证结果摘要
    console.log('\n=====================================');
    if (allValid) {
      console.log('✅ 数据验证通过！');
      console.log(`  - 包含34个省级行政区`);
      console.log(`  - 所有节点都包含必要字段`);
      console.log(`  - 所有区县都有children数组`);
      console.log(`  - 数据结构完整`);
    } else {
      console.log('❌ 数据验证未通过！');
    }
    console.log('=====================================');
    
    return allValid;
    
  } catch (error) {
    console.error('\n=====================================');
    console.error(`❌ 验证失败: ${error.message}`);
    console.error('=====================================');
    return false;
  }
}

// 执行验证
const isValid = validateAddressData();
process.exit(isValid ? 0 : 1);
