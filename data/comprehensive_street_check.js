import fs from 'fs';
import path from 'path';

// 读取现有的地址数据
const addressDataPath = path.join(process.cwd(), 'addressData.ts');
const addressDataContent = fs.readFileSync(addressDataPath, 'utf-8');

// 解析地址数据（使用正则表达式提取JSON部分）
const jsonMatch = addressDataContent.match(/const completeAddressData = ([\s\S]*?);\s*export default/);
if (!jsonMatch) {
  console.error('无法提取JSON数据，请检查文件格式');
  process.exit(1);
}

const jsonString = jsonMatch[1].trim();
let addressData;
try {
  addressData = JSON.parse(jsonString);
  console.log('成功解析地址数据，共', addressData.length, '个省份');
} catch (error) {
  console.error('JSON解析失败:', error.message);
  process.exit(1);
}

// 用户提到的问题地区列表
const problemAreas = [
  // 北京市
  { province: '北京市', districts: ['丰台区', '海淀区', '房山区'] },
  // 天津市
  { province: '天津市', districts: ['津南区', '武清区', '宝坻区', '静海区', '宁河区', '蓟州区', '滨海新区'] },
  // 上海市
  { province: '上海市', districts: ['闸北区', '虹口区'] },
  // 重庆市
  { province: '重庆市', districts: ['大渡口区', '涪陵区', '綦江区', '潼南区', '铜梁区', '永川区', '荣昌区', '合川区', '黔江区', '南川区', '北碚区', '长寿区', '垫江区', '武隆区', '奉节县', '开州区', '城口县', '云阳县', '忠县', '巫溪县', '巫山县', '江津区', '万州区'] }
];

// 检查街道名称是否有问题的关键词
const problemKeywords = ['xx', '地区', '市', '县', '区'];

// 检查问题地区的街道信息
function checkProblemAreas(data, problemAreas) {
  console.log('\n=== 街道数据问题检查结果 ===\n');
  
  // 遍历每个问题省份
  problemAreas.forEach(area => {
    console.log(`【${area.province}】`);
    
    // 找到对应的省份数据
    const province = data.find(p => p.label === area.province);
    if (!province || !province.children) {
      console.log(`  未找到${area.province}的数据或数据结构异常\n`);
      return;
    }
    
    // 遍历该省份的问题区县
    area.districts.forEach(districtName => {
      // 找到对应的区县数据
      const district = province.children.find(d => d.label === districtName);
      
      if (!district) {
        console.log(`  - ${districtName}: 未找到该区县数据`);
      } else {
        const hasChildren = district.children && district.children.length > 0;
        
        if (!hasChildren) {
          console.log(`  - ${districtName}: 无街道信息 (value: ${district.value})`);
        } else {
          // 检查街道数量
          console.log(`  - ${districtName}: 共${district.children.length}个街道 (value: ${district.value})`);
          
          // 检查街道名称是否有问题
          const problemStreets = district.children.filter(street => {
            return problemKeywords.some(keyword => street.label.includes(keyword));
          });
          
          if (problemStreets.length > 0) {
            console.log(`    存在问题街道名称:`);
            problemStreets.forEach(street => {
              console.log(`      - ${street.label} (value: ${street.value})`);
            });
          } else {
            console.log(`    街道名称格式正常`);
          }
          
          // 显示前5个街道作为示例
          console.log(`    示例街道: ${district.children.slice(0, 5).map(s => s.label).join(', ')}${district.children.length > 5 ? '...' : ''}`);
        }
      }
    });
    
    console.log('');
  });
}

// 执行检查
checkProblemAreas(addressData, problemAreas);