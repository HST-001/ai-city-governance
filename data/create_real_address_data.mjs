import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 真实的中国行政区划数据（简化版，包含主要城市和区县）
const chinaAddressData = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'beijing-chongwen', label: '崇文区', children: [] },
      { value: 'beijing-dongcheng', label: '东城区', children: [] },
      { value: 'beijing-chaoyang', label: '朝阳区', children: [] },
      { value: 'beijing-haidian', label: '海淀区', children: [] },
      { value: 'beijing-fengtai', label: '丰台区', children: [] },
      { value: 'beijing-shijingshan', label: '石景山区', children: [] },
      { value: 'beijing-mentougou', label: '门头沟区', children: [] },
      { value: 'beijing-fangshan', label: '房山区', children: [] },
      { value: 'beijing-tongzhou', label: '通州区', children: [] },
      { value: 'beijing-shunyi', label: '顺义区', children: [] },
      { value: 'beijing-changping', label: '昌平区', children: [] },
      { value: 'beijing-daxing', label: '大兴区', children: [] },
      { value: 'beijing-huairou', label: '怀柔区', children: [] },
      { value: 'beijing-miyun', label: '密云区', children: [] },
      { value: 'beijing-pinggu', label: '平谷区', children: [] },
      { value: 'beijing-yanshan', label: '燕山地区', children: [] }
    ]
  },
  {
    value: 'tianjin',
    label: '天津市',
    children: [
      { value: 'tianjin-heping', label: '和平区', children: [] },
      { value: 'tianjin-hexi', label: '河西区', children: [] },
      { value: 'tianjin-hebe', label: '河北区', children: [] },
      { value: 'tianjin-nankai', label: '南开区', children: [] },
      { value: 'tianjin-hedong', label: '河东区', children: [] }
    ]
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      { value: 'shanghai-pudong', label: '浦东新区', children: [] },
      { value: 'shanghai-jiading', label: '嘉定区', children: [] },
      { value: 'shanghai-qingpu', label: '青浦区', children: [] },
      { value: 'shanghai-minhang', label: '闵行区', children: [] },
      { value: 'shanghai-songjiang', label: '松江区', children: [] },
      { value: 'shanghai-jinshan', label: '金山区', children: [] },
      { value: 'shanghai-changning', label: '长宁区', children: [] },
      { value: 'shanghai-putuo', label: '普陀区', children: [] },
      { value: 'shanghai-zhabei', label: '闸北区', children: [] },
      { value: 'shanghai-jaingan', label: '静安区', children: [] },
      { value: 'shanghai-huangpu', label: '黄浦区', children: [] },
      { value: 'shanghai-xuhui', label: '徐汇区', children: [] },
      { value: 'shanghai-luwan', label: '卢湾区', children: [] }
    ]
  },
  {
    value: 'chongqing',
    label: '重庆市',
    children: [
      { value: 'chongqing-yuzhong', label: '渝中区', children: [] },
      { value: 'chongqing-jiangbei', label: '江北区', children: [] },
      { value: 'chongqing-nanan', label: '南岸区', children: [] },
      { value: 'chongqing-shapingba', label: '沙坪坝区', children: [] },
      { value: 'chongqing-yubei', label: '渝北区', children: [] },
      { value: 'chongqing-banan', label: '巴南区', children: [] }
    ]
  },
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [
          { value: 'guangzhou-yuexiu', label: '越秀区', children: [] },
          { value: 'guangzhou-haiZhu', label: '海珠区', children: [] },
          { value: 'guangzhou-liwan', label: '荔湾区', children: [] },
          { value: 'guangzhou-tianhe', label: '天河区', children: [] },
          { value: 'guangzhou-baogang', label: '白云区', children: [] },
          { value: 'guangzhou-panyu', label: '番禺区', children: [] }
        ]
      },
      {
        value: 'shenzhen',
        label: '深圳市',
        children: [
          { value: 'shenzhen-futian', label: '福田区', children: [] },
          { value: 'shenzhen-luohu', label: '罗湖区', children: [] },
          { value: 'shenzhen-nanshan', label: '南山区', children: [] },
          { value: 'shenzhen-yantian', label: '盐田区', children: [] },
          { value: 'shenzhen-baoan', label: '宝安区', children: [] },
          { value: 'shenzhen-longgang', label: '龙岗区', children: [] }
        ]
      },
      {
        value: 'dongguan',
        label: '东莞市',
        children: [
          { value: 'dongguan-changping', label: '常平镇', children: [] },
          { value: 'dongguan-humen', label: '虎门镇', children: [] },
          { value: 'dongguan-zhangmutou', label: '樟木头镇', children: [] },
          { value: 'dongguan-dongcheng', label: '东城街道', children: [] },
          { value: 'dongguan-nancheng', label: '南城街道', children: [] }
        ]
      },
      {
        value: 'foshan',
        label: '佛山市',
        children: [
          { value: 'foshan-chancheng', label: '禅城区', children: [] },
          { value: 'foshan-nanhai', label: '南海区', children: [] },
          { value: 'foshan-shunde', label: '顺德区', children: [] },
          { value: 'foshan-sanshui', label: '三水区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          { value: 'nanjing-xuanwu', label: '玄武区', children: [] },
          { value: 'nanjing-jianye', label: '建邺区', children: [] },
          { value: 'nanjing-gulou', label: '鼓楼区', children: [] },
          { value: 'nanjing-jiangning', label: '江宁区', children: [] }
        ]
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [
          { value: 'suzhou-pingjiang', label: '平江区', children: [] },
          { value: 'suzhou-canglang', label: '沧浪区', children: [] },
          { value: 'suzhou-gaoxin', label: '高新区', children: [] },
          { value: 'suzhou-wuzhong', label: '吴中区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'hangzhou-xiaoshan', label: '萧山区', children: [] },
          { value: 'hangzhou-yuhang', label: '余杭区', children: [] },
          { value: 'hangzhou-jianggan', label: '江干区', children: [] },
          { value: 'hangzhou-xihu', label: '西湖区', children: [] }
        ]
      },
      {
        value: 'ningbo',
        label: '宁波市',
        children: [
          { value: 'ningbo-haishu', label: '海曙区', children: [] },
          { value: 'ningbo-jiangdong', label: '江东区', children: [] },
          { value: 'ningbo-jiangbei', label: '江北区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'anhui',
    label: '安徽省',
    children: [
      {
        value: 'hefei',
        label: '合肥市',
        children: [
          { value: 'hefei-baohe', label: '包河区', children: [] },
          { value: 'hefei-yaohai', label: '瑶海区', children: [] },
          { value: 'hefei-luyang', label: '庐阳区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'fujian',
    label: '福建省',
    children: [
      {
        value: 'fuzhou',
        label: '福州市',
        children: [
          { value: 'fuzhou-gulou', label: '鼓楼区', children: [] },
          { value: 'fuzhou-taijiang', label: '台江区', children: [] },
          { value: 'fuzhou-cangshan', label: '仓山区', children: [] }
        ]
      },
      {
        value: 'xiamen',
        label: '厦门市',
        children: [
          { value: 'xiamen-siming', label: '思明区', children: [] },
          { value: 'xiamen-haicang', label: '海沧区', children: [] },
          { value: 'xiamen-jimei', label: '集美区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'jiangxi',
    label: '江西省',
    children: [
      {
        value: 'nanchang',
        label: '南昌市',
        children: [
          { value: 'nanchang-donghu', label: '东湖区', children: [] },
          { value: 'nanchang-xihu', label: '西湖区', children: [] },
          { value: 'nanchang-qingyunpu', label: '青云谱区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'shandong',
    label: '山东省',
    children: [
      {
        value: 'jinan',
        label: '济南市',
        children: [
          { value: 'jinan-licheng', label: '历城区', children: [] },
          { value: 'jinan-tianqiao', label: '天桥区', children: [] },
          { value: 'jinan-lixia', label: '历下区', children: [] }
        ]
      },
      {
        value: 'qingdao',
        label: '青岛市',
        children: [
          { value: 'qingdao-shinan', label: '市南区', children: [] },
          { value: 'qingdao-shibei', label: '市北区', children: [] },
          { value: 'qingdao-chengyang', label: '城阳区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'henan',
    label: '河南省',
    children: [
      {
        value: 'zhengzhou',
        label: '郑州市',
        children: [
          { value: 'zhengzhou-ershiqiao', label: '二七区', children: [] },
          { value: 'zhengzhou-guanchenghuizu', label: '管城回族区', children: [] },
          { value: 'zhengzhou-jinshui', label: '金水区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'hubei',
    label: '湖北省',
    children: [
      {
        value: 'wuhan',
        label: '武汉市',
        children: [
          { value: 'wuhan-qiaokou', label: '硚口区', children: [] },
          { value: 'wuhan-jianghan', label: '江汉区', children: [] },
          { value: 'wuhan-jingan', label: '江岸区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'hunan',
    label: '湖南省',
    children: [
      {
        value: 'changsha',
        label: '长沙市',
        children: [
          { value: 'changsha-furong', label: '芙蓉区', children: [] },
          { value: 'changsha-kaifu', label: '开福区', children: [] },
          { value: 'changsha-天心', label: '天心区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'guangxi',
    label: '广西壮族自治区',
    children: [
      {
        value: 'nanning',
        label: '南宁市',
        children: [
          { value: 'nanning-xingning', label: '兴宁区', children: [] },
          { value: 'nanning-jiangnan', label: '江南区', children: [] },
          { value: 'nanning-congzuo', label: '崇左市', children: [] }
        ]
      }
    ]
  },
  {
    value: 'hainan',
    label: '海南省',
    children: [
      {
        value: 'haikou',
        label: '海口市',
        children: [
          { value: 'haikou-longhua', label: '龙华区', children: [] },
          { value: 'haikou-meilan', label: '美兰区', children: [] },
          { value: 'haikou-xiuying', label: '秀英区', children: [] }
        ]
      },
      {
        value: 'sanya',
        label: '三亚市',
        children: [
          { value: 'sanya-tianya', label: '天涯区', children: [] },
          { value: 'sanya-jiyang', label: '吉阳区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'sichuan',
    label: '四川省',
    children: [
      {
        value: 'chengdu',
        label: '成都市',
        children: [
          { value: 'chengdu-chenghua', label: '成华区', children: [] },
          { value: 'chengdu-jinjiang', label: '锦江区', children: [] },
          { value: 'chengdu-qingyang', label: '青羊区', children: [] },
          { value: 'chengdu-wuhou', label: '武侯区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'guizhou',
    label: '贵州省',
    children: [
      {
        value: 'guiyang',
        label: '贵阳市',
        children: [
          { value: 'guiyang-yunyan', label: '云岩区', children: [] },
          { value: 'guiyang-nanming', label: '南明区', children: [] },
          { value: 'guiyang-baiyun', label: '白云区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'yunnan',
    label: '云南省',
    children: [
      {
        value: 'kunming',
        label: '昆明市',
        children: [
          { value: 'kunming-wuhua', label: '五华区', children: [] },
          { value: 'kunming-panlong', label: '盘龙区', children: [] },
          { value: 'kunming-guandu', label: '官渡区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'xizang',
    label: '西藏自治区',
    children: [
      {
        value: 'lasa',
        label: '拉萨市',
        children: [
          { value: 'lasa-chengguan', label: '城关区', children: [] },
          { value: 'lasa-doilungdeqen', label: '堆龙德庆区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'shaanxi',
    label: '陕西省',
    children: [
      {
        value: 'xian',
        label: '西安市',
        children: [
          { value: 'xian-beilin', label: '碑林区', children: [] },
          { value: 'xian-xincheng', label: '新城区', children: [] },
          { value: 'xian-yanliang', label: '阎良区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'gansu',
    label: '甘肃省',
    children: [
      {
        value: 'lanzhou',
        label: '兰州市',
        children: [
          { value: 'lanzhou-chengguan', label: '城关区', children: [] },
          { value: 'lanzhou-anshan', label: '安宁区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'qinghai',
    label: '青海省',
    children: [
      {
        value: 'xining',
        label: '西宁市',
        children: [
          { value: 'xining-chengguan', label: '城东区', children: [] },
          { value: 'xining-chengzhong', label: '城中区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'ningxia',
    label: '宁夏回族自治区',
    children: [
      {
        value: 'yinchuan',
        label: '银川市',
        children: [
          { value: 'yinchuan-helan', label: '贺兰县', children: [] },
          { value: 'yinchuan-xixia', label: '西夏区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'xinjiang',
    label: '新疆维吾尔自治区',
    children: [
      {
        value: 'urumqi',
        label: '乌鲁木齐市',
        children: [
          { value: 'urumqi-tianshan', label: '天山区', children: [] },
          { value: 'urumqi-shayibake', label: '沙依巴克区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'neimenggu',
    label: '内蒙古自治区',
    children: [
      {
        value: 'hohhot',
        label: '呼和浩特市',
        children: [
          { value: 'hohhot-horinger', label: '和林格尔县', children: [] },
          { value: 'hohhot-tumed', label: '土默特左旗', children: [] }
        ]
      },
      {
        value: 'baotou',
        label: '包头市',
        children: [
          { value: 'baotou-jiuyuan', label: '九原区', children: [] },
          { value: 'baotou-kunming', label: '昆都仑区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'hebei',
    label: '河北省',
    children: [
      {
        value: 'shijiazhuang',
        label: '石家庄市',
        children: [
          { value: 'shijiazhuang-qiaoxi', label: '桥西区', children: [] },
          { value: 'shijiazhuang-yuhua', label: '裕华区', children: [] }
        ]
      },
      {
        value: 'tangshan',
        label: '唐山市',
        children: [
          { value: 'tangshan-lubei', label: '路北区', children: [] },
          { value: 'tangshan-lunan', label: '路南区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'shanxi',
    label: '山西省',
    children: [
      {
        value: 'taiyuan',
        label: '太原市',
        children: [
          { value: 'taiyuan-xinghualing', label: '杏花岭区', children: [] },
          { value: 'taiyuan-xiaodian', label: '小店区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'liaoning',
    label: '辽宁省',
    children: [
      {
        value: 'shenyang',
        label: '沈阳市',
        children: [
          { value: 'shenyang-heping', label: '和平区', children: [] },
          { value: 'shenyang-shenhe', label: '沈河区', children: [] }
        ]
      },
      {
        value: 'dalian',
        label: '大连市',
        children: [
          { value: 'dalian-xigang', label: '西岗区', children: [] },
          { value: 'dalian-zhongshan', label: '中山区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'jilin',
    label: '吉林省',
    children: [
      {
        value: 'changchun',
        label: '长春市',
        children: [
          { value: 'changchun-chaoyang', label: '朝阳区', children: [] },
          { value: 'changchun-nanguan', label: '南关区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'heilongjiang',
    label: '黑龙江省',
    children: [
      {
        value: 'haerbin',
        label: '哈尔滨市',
        children: [
          { value: 'haerbin-daoli', label: '道里区', children: [] },
          { value: 'haerbin-daowai', label: '道外区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'taiwan',
    label: '台湾省',
    children: [
      {
        value: 'taipei',
        label: '台北市',
        children: [
          { value: 'taipei-daan', label: '大安区', children: [] },
          { value: 'taipei-songshan', label: '松山区', children: [] }
        ]
      },
      {
        value: 'taichung',
        label: '台中市',
        children: [
          { value: 'taichung-west', label: '西区', children: [] },
          { value: 'taichung-north', label: '北区', children: [] }
        ]
      }
    ]
  },
  {
    value: 'xianggang',
    label: '香港特别行政区',
    children: [
      { value: 'xianggang-wan chai', label: '湾仔区', children: [] },
      { value: 'xianggang-central', label: '中西区', children: [] },
      { value: 'xianggang-tsim sha tsui', label: '尖沙咀', children: [] }
    ]
  },
  {
    value: 'aomen',
    label: '澳门特别行政区',
    children: [
      { value: 'aomen-peninsula', label: '澳门半岛', children: [] },
      { value: 'aomen-taipa', label: '氹仔岛', children: [] },
      { value: 'aomen-coloane', label: '路环岛', children: [] }
    ]
  }
];

function createRealAddressData() {
  console.log('开始创建真实的中国地址数据文件...');
  
  try {
    // 1. 备份当前数据文件
    const DATA_PATH = path.join(__dirname, 'addressData.ts');
    const BACKUP_PATH = path.join(__dirname, `addressData_backup_${Date.now()}.ts`);
    
    if (fs.existsSync(DATA_PATH)) {
      fs.copyFileSync(DATA_PATH, BACKUP_PATH);
      console.log(`✅ 已备份当前数据文件到: ${path.basename(BACKUP_PATH)}`);
    }
    
    // 2. 准备文件内容
    const fileContent = `// 真实的中国地址数据
// 包含34个省级行政区、主要城市和区县数据

const completeAddressData = ${JSON.stringify(chinaAddressData, null, 2)};

export default completeAddressData;
`;
    
    // 3. 写入文件
    fs.writeFileSync(DATA_PATH, fileContent, 'utf8');
    console.log(`✅ 已成功创建新的地址数据文件: ${path.basename(DATA_PATH)}`);
    
    // 4. 验证创建的文件
    const createdFile = fs.readFileSync(DATA_PATH, 'utf8');
    console.log(`✅ 创建的文件大小: ${createdFile.length} 字节`);
    
    // 5. 打印统计信息
    console.log('\n📊 数据统计:');
    console.log(`  - 省级行政区数量: ${chinaAddressData.length}`);
    
    let totalCities = 0;
    let totalDistricts = 0;
    
    chinaAddressData.forEach(province => {
      if (province.children && province.children.length > 0) {
        province.children.forEach(city => {
          totalCities++;
          if (city.children && city.children.length > 0) {
            totalDistricts += city.children.length;
          }
        });
      }
    });
    
    console.log(`  - 城市数量: ${totalCities}`);
    console.log(`  - 区县数量: ${totalDistricts}`);
    console.log(`\n✅ 真实地址数据文件创建完成！`);
    
  } catch (error) {
    console.error('\n❌ 创建地址数据文件失败:', error.message);
    process.exit(1);
  }
}

// 执行脚本
createRealAddressData();