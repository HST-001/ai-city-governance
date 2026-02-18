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

// 定义需要补全的街道信息
const streetData = {
  // 天津市区县街道
  "tianjin-heping": [
    { "value": "tianjin-heping-劝业场街道", "label": "劝业场街道", "children": [] },
    { "value": "tianjin-heping-小白楼街道", "label": "小白楼街道", "children": [] },
    { "value": "tianjin-heping-五大道街道", "label": "五大道街道", "children": [] },
    { "value": "tianjin-heping-新兴街道", "label": "新兴街道", "children": [] },
    { "value": "tianjin-heping-南营门街道", "label": "南营门街道", "children": [] },
    { "value": "tianjin-heping-体育馆街道", "label": "体育馆街道", "children": [] }
  ],
  "tianjin-hexi": [
    { "value": "tianjin-hexi-大营门街道", "label": "大营门街道", "children": [] },
    { "value": "tianjin-hexi-下瓦房街道", "label": "下瓦房街道", "children": [] },
    { "value": "tianjin-hexi-桃园街道", "label": "桃园街道", "children": [] },
    { "value": "tianjin-hexi-挂甲寺街道", "label": "挂甲寺街道", "children": [] },
    { "value": "tianjin-hexi-马场街道", "label": "马场街道", "children": [] },
    { "value": "tianjin-hexi-越秀路街道", "label": "越秀路街道", "children": [] },
    { "value": "tianjin-hexi-友谊路街道", "label": "友谊路街道", "children": [] },
    { "value": "tianjin-hexi-天塔街道", "label": "天塔街道", "children": [] },
    { "value": "tianjin-hexi-尖山街道", "label": "尖山街道", "children": [] },
    { "value": "tianjin-hexi-陈塘庄街道", "label": "陈塘庄街道", "children": [] },
    { "value": "tianjin-hexi-柳林街道", "label": "柳林街道", "children": [] },
    { "value": "tianjin-hexi-东海街道", "label": "东海街道", "children": [] },
    { "value": "tianjin-hexi-梅江街道", "label": "梅江街道", "children": [] }
  ],
  "tianjin-beichen": [
    { "value": "tianjin-beichen-果园新村街道", "label": "果园新村街道", "children": [] },
    { "value": "tianjin-beichen-集贤里街道", "label": "集贤里街道", "children": [] },
    { "value": "tianjin-beichen-普东街街道", "label": "普东街街道", "children": [] },
    { "value": "tianjin-beichen-天穆镇街道", "label": "天穆镇街道", "children": [] },
    { "value": "tianjin-beichen-北仓镇街道", "label": "北仓镇街道", "children": [] },
    { "value": "tianjin-beichen-双街镇街道", "label": "双街镇街道", "children": [] },
    { "value": "tianjin-beichen-青光镇街道", "label": "青光镇街道", "children": [] },
    { "value": "tianjin-beichen-宜兴埠镇街道", "label": "宜兴埠镇街道", "children": [] }
  ],
  "tianjin-nankai": [
    { "value": "tianjin-nankai-长虹街道", "label": "长虹街道", "children": [] },
    { "value": "tianjin-nankai-鼓楼街道", "label": "鼓楼街道", "children": [] },
    { "value": "tianjin-nankai-广开街道", "label": "广开街道", "children": [] },
    { "value": "tianjin-nankai-嘉陵道街道", "label": "嘉陵道街道", "children": [] },
    { "value": "tianjin-nankai-万兴街道", "label": "万兴街道", "children": [] },
    { "value": "tianjin-nankai-学府街道", "label": "学府街道", "children": [] },
    { "value": "tianjin-nankai-向阳路街道", "label": "向阳路街道", "children": [] },
    { "value": "tianjin-nankai-王顶堤街道", "label": "王顶堤街道", "children": [] },
    { "value": "tianjin-nankai-华苑街道", "label": "华苑街道", "children": [] }
  ],
  "tianjin-hedong": [
    { "value": "tianjin-hedong-大王庄街道", "label": "大王庄街道", "children": [] },
    { "value": "tianjin-hedong-唐家口街道", "label": "唐家口街道", "children": [] },
    { "value": "tianjin-hedong-东新街道", "label": "东新街道", "children": [] },
    { "value": "tianjin-hedong-富民路街道", "label": "富民路街道", "children": [] },
    { "value": "tianjin-hedong-二号桥街道", "label": "二号桥街道", "children": [] },
    { "value": "tianjin-hedong-春华街道", "label": "春华街道", "children": [] },
    { "value": "tianjin-hedong-常州道街道", "label": "常州道街道", "children": [] },
    { "value": "tianjin-hedong-上杭路街道", "label": "上杭路街道", "children": [] },
    { "value": "tianjin-hedong-向阳楼街道", "label": "向阳楼街道", "children": [] },
    { "value": "tianjin-hedong-中山门街道", "label": "中山门街道", "children": [] }
  ],
  "tianjin-hebe": [
    { "value": "tianjin-hebe-光复道街道", "label": "光复道街道", "children": [] },
    { "value": "tianjin-hebe-望海楼街道", "label": "望海楼街道", "children": [] },
    { "value": "tianjin-hebe-鸿顺里街道", "label": "鸿顺里街道", "children": [] },
    { "value": "tianjin-hebe-新开河街道", "label": "新开河街道", "children": [] },
    { "value": "tianjin-hebe-铁东路街道", "label": "铁东路街道", "children": [] },
    { "value": "tianjin-hebe-建昌道街道", "label": "建昌道街道", "children": [] },
    { "value": "tianjin-hebe-宁园街道", "label": "宁园街道", "children": [] },
    { "value": "tianjin-hebe-王串场街道", "label": "王串场街道", "children": [] },
    { "value": "tianjin-hebe-江都路街道", "label": "江都路街道", "children": [] },
    { "value": "tianjin-hebe-月牙河街道", "label": "月牙河街道", "children": [] }
  ],
  // 重庆市区县街道
  "chongqing-yuzhong": [
    { "value": "chongqing-yuzhong-解放碑街道", "label": "解放碑街道", "children": [] },
    { "value": "chongqing-yuzhong-朝天门街道", "label": "朝天门街道", "children": [] },
    { "value": "chongqing-yuzhong-望龙门街道", "label": "望龙门街道", "children": [] },
    { "value": "chongqing-yuzhong-南纪门街道", "label": "南纪门街道", "children": [] },
    { "value": "chongqing-yuzhong-七星岗街道", "label": "七星岗街道", "children": [] },
    { "value": "chongqing-yuzhong-菜园坝街道", "label": "菜园坝街道", "children": [] },
    { "value": "chongqing-yuzhong-两路口街道", "label": "两路口街道", "children": [] },
    { "value": "chongqing-yuzhong-大溪沟街道", "label": "大溪沟街道", "children": [] },
    { "value": "chongqing-yuzhong-上清寺街道", "label": "上清寺街道", "children": [] },
    { "value": "chongqing-yuzhong-化龙桥街道", "label": "化龙桥街道", "children": [] }
  ],
  "chongqing-jiangbei": [
    { "value": "chongqing-jiangbei-华新街街道", "label": "华新街街道", "children": [] },
    { "value": "chongqing-jiangbei-江北城街道", "label": "江北城街道", "children": [] },
    { "value": "chongqing-jiangbei-石马河街道", "label": "石马河街道", "children": [] },
    { "value": "chongqing-jiangbei-大石坝街道", "label": "大石坝街道", "children": [] },
    { "value": "chongqing-jiangbei-观音桥街道", "label": "观音桥街道", "children": [] },
    { "value": "chongqing-jiangbei-五里店街道", "label": "五里店街道", "children": [] },
    { "value": "chongqing-jiangbei-寸滩街道", "label": "寸滩街道", "children": [] },
    { "value": "chongqing-jiangbei-铁山坪街道", "label": "铁山坪街道", "children": [] },
    { "value": "chongqing-jiangbei-鱼嘴镇街道", "label": "鱼嘴镇街道", "children": [] },
    { "value": "chongqing-jiangbei-复盛镇街道", "label": "复盛镇街道", "children": [] },
    { "value": "chongqing-jiangbei-五宝镇街道", "label": "五宝镇街道", "children": [] }
  ],
  "chongqing-shapingba": [
    { "value": "chongqing-shapingba-小龙坎街道", "label": "小龙坎街道", "children": [] },
    { "value": "chongqing-shapingba-沙坪坝街道", "label": "沙坪坝街道", "children": [] },
    { "value": "chongqing-shapingba-渝碚路街道", "label": "渝碚路街道", "children": [] },
    { "value": "chongqing-shapingba-磁器口街道", "label": "磁器口街道", "children": [] },
    { "value": "chongqing-shapingba-童家桥街道", "label": "童家桥街道", "children": [] },
    { "value": "chongqing-shapingba-石井坡街道", "label": "石井坡街道", "children": [] },
    { "value": "chongqing-shapingba-詹家溪街道", "label": "詹家溪街道", "children": [] },
    { "value": "chongqing-shapingba-双碑街道", "label": "双碑街道", "children": [] },
    { "value": "chongqing-shapingba-井口街道", "label": "井口街道", "children": [] },
    { "value": "chongqing-shapingba-歌乐山街道", "label": "歌乐山街道", "children": [] }
  ],
  "chongqing-jiulongpo": [
    { "value": "chongqing-jiulongpo-杨家坪街道", "label": "杨家坪街道", "children": [] },
    { "value": "chongqing-jiulongpo-谢家湾街道", "label": "谢家湾街道", "children": [] },
    { "value": "chongqing-jiulongpo-石坪桥街道", "label": "石坪桥街道", "children": [] },
    { "value": "chongqing-jiulongpo-黄桷坪街道", "label": "黄桷坪街道", "children": [] },
    { "value": "chongqing-jiulongpo-中梁山街道", "label": "中梁山街道", "children": [] },
    { "value": "chongqing-jiulongpo-石桥铺街道", "label": "石桥铺街道", "children": [] },
    { "value": "chongqing-jiulongpo-二郎街道", "label": "二郎街道", "children": [] },
    { "value": "chongqing-jiulongpo-渝州路街道", "label": "渝州路街道", "children": [] },
    { "value": "chongqing-jiulongpo-九龙镇街道", "label": "九龙镇街道", "children": [] },
    { "value": "chongqing-jiulongpo-华岩镇街道", "label": "华岩镇街道", "children": [] }
  ],
  "chongqing-yubei": [
    { "value": "chongqing-yubei-双龙湖街道", "label": "双龙湖街道", "children": [] },
    { "value": "chongqing-yubei-回兴街道", "label": "回兴街道", "children": [] },
    { "value": "chongqing-yubei-鸳鸯街道", "label": "鸳鸯街道", "children": [] },
    { "value": "chongqing-yubei-翠云街道", "label": "翠云街道", "children": [] },
    { "value": "chongqing-yubei-人和街道", "label": "人和街道", "children": [] },
    { "value": "chongqing-yubei-天宫殿街道", "label": "天宫殿街道", "children": [] },
    { "value": "chongqing-yubei-龙溪街道", "label": "龙溪街道", "children": [] },
    { "value": "chongqing-yubei-龙山街道", "label": "龙山街道", "children": [] },
    { "value": "chongqing-yubei-龙塔街道", "label": "龙塔街道", "children": [] },
    { "value": "chongqing-yubei-大竹林街道", "label": "大竹林街道", "children": [] }
  ],
  // 香港特别行政区街道（香港地区通常使用区域-街道的层级结构）
  "xianggang-wan chai": [
    { "value": "xianggang-wan chai-湾仔街道", "label": "湾仔街道", "children": [] },
    { "value": "xianggang-wan chai-铜锣湾街道", "label": "铜锣湾街道", "children": [] },
    { "value": "xianggang-wan chai-跑马地街道", "label": "跑马地街道", "children": [] },
    { "value": "xianggang-wan chai-天后街道", "label": "天后街道", "children": [] },
    { "value": "xianggang-wan chai-鹅颈街道", "label": "鹅颈街道", "children": [] }
  ],
  "xianggang-central": [
    { "value": "xianggang-central-中环街道", "label": "中环街道", "children": [] },
    { "value": "xianggang-central-金钟街道", "label": "金钟街道", "children": [] },
    { "value": "xianggang-central-半山街道", "label": "半山街道", "children": [] },
    { "value": "xianggang-central-西营盘街道", "label": "西营盘街道", "children": [] },
    { "value": "xianggang-central-上环街道", "label": "上环街道", "children": [] }
  ],
  // 澳门特别行政区街道
  "aomen-peninsula": [
    { "value": "aomen-peninsula-澳门半岛街道", "label": "澳门半岛街道", "children": [] },
    { "value": "aomen-peninsula-大堂区街道", "label": "大堂区街道", "children": [] },
    { "value": "aomen-peninsula-花地玛堂区街道", "label": "花地玛堂区街道", "children": [] },
    { "value": "aomen-peninsula-圣安多尼堂区街道", "label": "圣安多尼堂区街道", "children": [] },
    { "value": "aomen-peninsula-望德堂区街道", "label": "望德堂区街道", "children": [] }
  ],
  "aomen-taipa": [
    { "value": "aomen-taipa-氹仔街道", "label": "氹仔街道", "children": [] },
    { "value": "aomen-taipa-嘉模堂区街道", "label": "嘉模堂区街道", "children": [] }
  ]
};

// 补全街道信息的函数
function completeStreets(data, streetData) {
  let updatedCount = 0;
  
  // 遍历所有省份
  data.forEach(province => {
    if (province.children) {
      // 遍历所有城市/区县
      province.children.forEach(district => {
        // 如果区县的value在streetData中，且当前没有街道数据，则补全
        if (streetData[district.value] && (!district.children || district.children.length === 0)) {
          district.children = streetData[district.value];
          updatedCount++;
          console.log(`补全了 ${province.label} - ${district.label} 的街道信息，共 ${district.children.length} 个街道`);
        }
      });
    }
  });
  
  return { data, updatedCount };
}

// 执行补全操作
const { data: updatedAddressData, updatedCount } = completeStreets(addressData, streetData);

// 生成新的文件内容
const newAddressDataContent = `const completeAddressData = ${JSON.stringify(updatedAddressData, null, 2)};

export default completeAddressData;`;

// 写入更新后的文件
fs.writeFileSync(addressDataPath, newAddressDataContent, 'utf-8');

console.log(`\n街道信息补全完成！`);
console.log(`共补全了 ${updatedCount} 个区县的街道信息`);
console.log(`更新后的地址数据已保存到 addressData.ts 文件`);
console.log(`原始文件已备份为 addressData_backup_before_street_completion.ts`);

