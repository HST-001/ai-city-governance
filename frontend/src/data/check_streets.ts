import completeAddressData from './addressData';

// 检查指定地区的街道信息
function checkStreets(provinceLabel: string, districtLabel: string) {
  // 查找省份
  const province = completeAddressData.find(p => p.label === provinceLabel);
  if (!province) {
    console.log(`未找到省份: ${provinceLabel}`);
    return;
  }
  
  // 查找区县
  const district = province.children.find(d => d.label === districtLabel);
  if (!district) {
    console.log(`未找到区县: ${districtLabel}`);
    return;
  }
  
  // 检查街道
  const streets = district.children || [];
  console.log(`${provinceLabel} - ${districtLabel}: ${streets.length}条街道`);
  
  if (streets.length > 0) {
    // 检查街道名称是否有问题
    const problematicStreets = streets.filter(street => 
      street.label.includes('xx') || 
      street.label.includes('地区') || 
      street.label.includes('市') || 
      street.label.includes('县') ||
      street.label.includes('区')
    );
    
    if (problematicStreets.length > 0) {
      console.log(`  问题街道: ${problematicStreets.map(s => s.label).join(', ')}`);
    }
  } else {
    console.log(`  ❌ 无街道数据`);
  }
}

// 检查用户提到的所有地区
console.log('=== 街道数据检查结果 ===\n');

// 北京市
console.log('北京市:');
checkStreets('北京市', '丰台区');
checkStreets('北京市', '海淀区');
checkStreets('北京市', '房山区');

// 天津市
console.log('\n天津市:');
checkStreets('天津市', '津南区');
checkStreets('天津市', '武清区');
checkStreets('天津市', '宝坻区');
checkStreets('天津市', '静海区');
checkStreets('天津市', '宁河区');
checkStreets('天津市', '蓟州区');
checkStreets('天津市', '滨海新区');

// 上海市
console.log('\n上海市:');
checkStreets('上海市', '闸北区');
checkStreets('上海市', '虹口区');
checkStreets('上海市', '崇明区');

// 重庆市
console.log('\n重庆市:');
checkStreets('重庆市', '大渡口区');
checkStreets('重庆市', '涪陵区');
checkStreets('重庆市', '綦江区');
checkStreets('重庆市', '潼南区');
checkStreets('重庆市', '铜梁区');
checkStreets('重庆市', '永川区');
checkStreets('重庆市', '荣昌区');
checkStreets('重庆市', '合川区');
checkStreets('重庆市', '黔江区');
checkStreets('重庆市', '南川区');
checkStreets('重庆市', '北碚区');
checkStreets('重庆市', '长寿区');
checkStreets('重庆市', '垫江区');
checkStreets('重庆市', '武隆区');
checkStreets('重庆市', '奉节县');
checkStreets('重庆市', '开州区');
checkStreets('重庆市', '城口县');
checkStreets('重庆市', '云阳县');
checkStreets('重庆市', '忠县');
checkStreets('重庆市', '巫溪县');
checkStreets('重庆市', '巫山县');
checkStreets('重庆市', '江津区');

console.log('\n=== 检查完成 ===');

