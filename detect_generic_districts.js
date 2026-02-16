// 检测使用通用名称的城市县区数据脚本
const fs = require('fs');
const path = require('path');

function detectGenericDistrictNames() {
  try {
    const filePath = path.join(__dirname, 'frontend', 'src', 'data', 'addressData.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    console.log('开始检测使用通用名称的城市县区数据...');
    console.log('文件路径:', filePath);
    
    // 统计信息
    const problematicCities = [];
    let totalProblematicCities = 0;
    let totalCheckedCities = 0;
    
    // 使用正则表达式匹配所有城市块
    const cityRegex = /\{\s*value:\s*['"]([\u4e00-\u9fa5]+?)['"],\s*label:\s*['"]([\u4e00-\u9fa5]+?)['"],\s*children:/g;
    let cityMatch;
    
    // 当前处理的省份
    let currentProvince = '';
    const provinceRegex = /\{\s*value:\s*['"]([\u4e00-\u9fa5]+?)['"],\s*label:\s*['"]([\u4e00-\u9fa5]+?)['"],\s*children:/g;
    let provinceMatch;
    
    // 先记录所有省份信息
    const provinces = [];
    while ((provinceMatch = provinceRegex.exec(content)) !== null) {
      provinces.push({
        name: provinceMatch[1],
        startIndex: provinceMatch.index
      });
    }
    
    // 获取某个位置所在的省份
    function getProvinceByIndex(index) {
      for (let i = 0; i < provinces.length; i++) {
        if (i === provinces.length - 1 || index < provinces[i + 1].startIndex) {
          return provinces[i].name;
        }
      }
      return '';
    }
    
    // 遍历所有城市
    while ((cityMatch = cityRegex.exec(content)) !== null) {
      const cityName = cityMatch[1];
      const matchStart = cityMatch.index;
      const matchEnd = matchStart + cityMatch[0].length;
      
      // 跳过省级单位
      if (cityName.endsWith('省') || cityName.endsWith('自治区') || 
          cityName.endsWith('市') && (cityName === '北京市' || cityName === '天津市' || 
          cityName === '上海市' || cityName === '重庆市') || 
          cityName.endsWith('特别行政区')) {
        continue;
      }
      
      totalCheckedCities++;
      
      // 找到这个城市块的结束位置
      let bracketCount = 1;
      let i = matchEnd;
      while (i < content.length && bracketCount > 0) {
        if (content[i] === '{') bracketCount++;
        if (content[i] === '}') bracketCount--;
        i++;
      }
      
      const cityBlock = content.substring(matchStart, i);
      const provinceName = getProvinceByIndex(matchStart);
      
      // 检测是否包含通用名称
      const hasGenericNames = 
        cityBlock.includes('市辖区') ||
        cityBlock.includes('经济开发区') ||
        cityBlock.includes('高新技术产业开发区');
      
      if (hasGenericNames) {
        // 提取县区数据进行进一步分析
        const districtRegex = /\{\s*['"]?value['"]?:\s*['"]([^'"]*?)['"],\s*['"]?label['"]?:\s*['"]([^'"]*?)['"]\s*\}/g;
        const districts = [];
        let districtMatch;
        
        while ((districtMatch = districtRegex.exec(cityBlock)) !== null) {
          districts.push(districtMatch[2]);
        }
        
        // 检查是否全是通用名称
        let allGeneric = true;
        let genericDistrictCount = 0;
        const genericDistricts = [];
        
        districts.forEach(district => {
          if (district.includes('市辖区') || 
              district.includes('经济开发区') || 
              district.includes('高新技术产业开发区')) {
            genericDistrictCount++;
            genericDistricts.push(district);
          } else {
            allGeneric = false;
          }
        });
        
        totalProblematicCities++;
        problematicCities.push({
          province: provinceName,
          city: cityName,
          districts: districts,
          genericDistricts: genericDistricts,
          allGeneric: allGeneric,
          genericCount: genericDistrictCount,
          totalDistricts: districts.length
        });
      }
    }
    
    // 输出检测结果
    console.log('\n📊 检测结果统计:');
    console.log(`   - 总共检查城市: ${totalCheckedCities}`);
    console.log(`   - 发现问题城市: ${totalProblematicCities}`);
    
    if (problematicCities.length > 0) {
      console.log('\n❌ 问题城市详细列表:');
      
      // 按省份分组显示
      const citiesByProvince = {};
      problematicCities.forEach(city => {
        if (!citiesByProvince[city.province]) {
          citiesByProvince[city.province] = [];
        }
        citiesByProvince[city.province].push(city);
      });
      
      let index = 1;
      for (const province in citiesByProvince) {
        console.log(`\n🔹 省份: ${province}`);
        
        citiesByProvince[province].forEach(city => {
          console.log(`   ${index++}. ${city.city}`);
          console.log(`      - 通用县区: ${city.genericCount}/${city.totalDistricts}`);
          console.log(`      - 示例通用县区: ${city.genericDistricts.slice(0, 3).join(', ')}`);
        });
      }
      
      // 将结果保存到文件
      const outputData = {
        summary: {
          totalCheckedCities,
          totalProblematicCities
        },
        cities: problematicCities
      };
      
      const outputPath = path.join(__dirname, 'problematic_cities_report.json');
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
      console.log(`\n✅ 详细报告已保存到: ${outputPath}`);
      console.log(`\n📋 建议: 请根据报告为这些城市准备正确的县区数据`);
    } else {
      console.log('\n✅ 未发现使用通用县区名称的城市！');
    }
    
  } catch (error) {
    console.log('❌ 检测过程中出错：', error.message);
    console.error(error.stack);
  }
}

detectGenericDistrictNames();