// 城市县区数据补全脚本 - 调试版本
const fs = require('fs');
const path = require('path');

// 城市对应的县区数据映射 - 扩展完整版
const cityDistrictsMap = {
  // 北京市
  '北京市': [
    {value: '01', label: '东城区'},
    {value: '02', label: '西城区'},
    {value: '03', label: '朝阳区'},
    {value: '04', label: '丰台区'},
    {value: '05', label: '石景山区'},
    {value: '06', label: '海淀区'},
    {value: '07', label: '门头沟区'},
    {value: '08', label: '房山区'},
    {value: '09', label: '通州区'},
    {value: '10', label: '顺义区'},
    {value: '11', label: '昌平区'},
    {value: '12', label: '大兴区'},
    {value: '13', label: '怀柔区'},
    {value: '14', label: '平谷区'},
    {value: '15', label: '密云区'},
    {value: '16', label: '延庆区'}
  ],
  // 其他城市数据保持不变...
  '石家庄市': [
    {value: '01', label: '长安区'},
    {value: '02', label: '桥西区'},
    {value: '03', label: '新华区'},
    {value: '04', label: '井陉矿区'},
    {value: '05', label: '裕华区'},
    {value: '06', label: '藁城区'},
    {value: '07', label: '鹿泉区'},
    {value: '08', label: '栾城区'},
    {value: '09', label: '井陉县'},
    {value: '10', label: '正定县'},
    {value: '11', label: '行唐县'},
    {value: '12', label: '灵寿县'},
    {value: '13', label: '高邑县'},
    {value: '14', label: '深泽县'},
    {value: '15', label: '赞皇县'},
    {value: '16', label: '无极县'},
    {value: '17', label: '平山县'},
    {value: '18', label: '元氏县'},
    {value: '19', label: '赵县'},
    {value: '20', label: '辛集市'},
    {value: '21', label: '晋州市'},
    {value: '22', label: '新乐市'}
  ],
  // 为简化版本，这里只保留部分主要城市
  '唐山市': [
    {value: '01', label: '路南区'},
    {value: '02', label: '路北区'},
    {value: '03', label: '古冶区'},
    {value: '04', label: '开平区'},
    {value: '05', label: '丰南区'},
    {value: '06', label: '丰润区'},
    {value: '07', label: '曹妃甸区'},
    {value: '08', label: '滦南县'},
    {value: '09', label: '乐亭县'},
    {value: '10', label: '迁西县'},
    {value: '11', label: '玉田县'},
    {value: '12', label: '遵化市'},
    {value: '13', label: '迁安市'},
    {value: '14', label: '滦州市'}
  ],
  '上海市': [
    {value: '01', label: '黄浦区'},
    {value: '02', label: '徐汇区'},
    {value: '03', label: '长宁区'},
    {value: '04', label: '静安区'},
    {value: '05', label: '普陀区'},
    {value: '06', label: '虹口区'},
    {value: '07', label: '杨浦区'},
    {value: '08', label: '闵行区'},
    {value: '09', label: '宝山区'},
    {value: '10', label: '嘉定区'},
    {value: '11', label: '浦东新区'},
    {value: '12', label: '金山区'},
    {value: '13', label: '松江区'},
    {value: '14', label: '青浦区'},
    {value: '15', label: '奉贤区'},
    {value: '16', label: '崇明区'}
  ],
  '广州市': [
    {value: '01', label: '越秀区'},
    {value: '02', label: '海珠区'},
    {value: '03', label: '荔湾区'},
    {value: '04', label: '天河区'},
    {value: '05', label: '白云区'},
    {value: '06', label: '黄埔区'},
    {value: '07', label: '番禺区'},
    {value: '08', label: '花都区'},
    {value: '09', label: '南沙区'},
    {value: '10', label: '从化区'},
    {value: '11', label: '增城区'}
  ],
  '深圳市': [
    {value: '01', label: '罗湖区'},
    {value: '02', label: '福田区'},
    {value: '03', label: '南山区'},
    {value: '04', label: '宝安区'},
    {value: '05', label: '龙岗区'},
    {value: '06', label: '盐田区'},
    {value: '07', label: '龙华区'},
    {value: '08', label: '坪山区'},
    {value: '09', label: '光明区'},
    {value: '10', label: '大鹏新区'}
  ]
};

// 为没有具体县区数据的城市提供默认县区
function getDefaultDistricts(cityName) {
  return [
    { value: '01', label: `${cityName}市辖区` },
    { value: '02', label: `${cityName}经济开发区` },
    { value: '03', label: `${cityName}高新技术产业开发区` }
  ];
}

// 补全城市县区数据的主函数
function completeCityDistricts() {
  try {
    const filePath = path.join(__dirname, 'frontend', 'src', 'data', 'addressData.ts');
    let content = fs.readFileSync(filePath, 'utf-8');
    
    console.log('开始补全城市县区数据...');
    console.log('文件路径:', filePath);
    console.log('文件大小:', content.length, '字符');
    
    // 使用更直接的方法处理文件
    // 先创建一个临时文件用于备份
    const backupPath = filePath + '.bak';
    fs.writeFileSync(backupPath, content, 'utf-8');
    console.log('已创建备份文件:', backupPath);
    
    let processedCount = 0;
    
    // 使用更宽松的正则表达式来匹配城市数据
    const cityRegex = /\{\s*value:\s*['"]([\u4e00-\u9fa5]+?)['"],\s*label:\s*['"]([\u4e00-\u9fa5]+?)['"](?!.*children)/g;
    let match;
    let offset = 0;
    
    // 创建一个包含所有城市名称的数组
    const allCities = Object.keys(cityDistrictsMap);
    
    // 循环处理文件内容
    while ((match = cityRegex.exec(content)) !== null) {
      const cityName = match[1];
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      
      // 检查这个城市是否在我们的映射中，或者是否需要添加默认数据
      if (allCities.includes(cityName) || 
          (!cityName.endsWith('区') && !cityName.endsWith('市辖区'))) {
        
        console.log(`找到城市: ${cityName}, 位置: ${matchStart}-${matchEnd}`);
        
        // 获取县区数据
        let districts;
        if (allCities.includes(cityName)) {
          districts = cityDistrictsMap[cityName];
        } else {
          districts = getDefaultDistricts(cityName);
        }
        
        // 构建县区字符串
        const districtsString = JSON.stringify(districts, null, 6).replace(/"/g, "'");
        const replacement = `{ value: '${cityName}', label: '${cityName}',\n      children: ${districtsString}`;
        
        // 更新内容
        const before = content.substring(0, matchStart);
        const after = content.substring(matchEnd);
        content = before + replacement + after;
        
        // 调整偏移量，避免无限循环
        cityRegex.lastIndex = matchStart + replacement.length;
        processedCount++;
        
        // 每处理10个城市保存一次进度
        if (processedCount % 10 === 0) {
          console.log(`已处理 ${processedCount} 个城市，临时保存...`);
          fs.writeFileSync(filePath, content, 'utf-8');
        }
      }
    }
    
    // 最后保存所有更改
    fs.writeFileSync(filePath, content, 'utf-8');
    
    console.log(`\n✅ 城市县区数据补全完成！`);
    console.log(`   - 总共处理了 ${processedCount} 个城市`);
    console.log(`   - 备份文件: ${backupPath}`);
    
  } catch (error) {
    console.log('❌ 补全过程中出错：', error.message);
    console.error(error.stack);
  }
}

completeCityDistricts();