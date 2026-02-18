import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在ES模块中定义__dirname和__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 官方区县数据（根据最新行政区划整理）
const officialDistrictData = {
  "beijing": [
    { "value": "beijing-dongcheng", "label": "东城区" },
    { "value": "beijing-xicheng", "label": "西城区" },
    { "value": "beijing-chongwen", "label": "崇文区" },
    { "value": "beijing-xuanwu", "label": "宣武区" },
    { "value": "beijing-chaoyang", "label": "朝阳区" },
    { "value": "beijing-fengtai", "label": "丰台区" },
    { "value": "beijing-shijingshan", "label": "石景山区" },
    { "value": "beijing-haidian", "label": "海淀区" },
    { "value": "beijing-tongzhou", "label": "通州区" },
    { "value": "beijing-shunyi", "label": "顺义区" },
    { "value": "beijing-changping", "label": "昌平区" },
    { "value": "beijing-daxing", "label": "大兴区" },
    { "value": "beijing-fangshan", "label": "房山区" },
    { "value": "beijing-mentougou", "label": "门头沟区" },
    { "value": "beijing-pinggu", "label": "平谷区" },
    { "value": "beijing-miyun", "label": "密云区" },
    { "value": "beijing-huairou", "label": "怀柔区" },
    { "value": "beijing-yanqing", "label": "延庆区" }
  ],
  "shanghai": [
    { "value": "shanghai-huangpu", "label": "黄浦区" },
    { "value": "shanghai-xuhui", "label": "徐汇区" },
    { "value": "shanghai-jingan", "label": "静安区" },
    { "value": "shanghai-putuo", "label": "普陀区" },
    { "value": "shanghai-changning", "label": "长宁区" },
    { "value": "shanghai-hongkou", "label": "虹口区" },
    { "value": "shanghai-yangpu", "label": "杨浦区" },
    { "value": "shanghai-pudong", "label": "浦东新区" },
    { "value": "shanghai-jiading", "label": "嘉定区" },
    { "value": "shanghai-baoshan", "label": "宝山区" },
    { "value": "shanghai-minhang", "label": "闵行区" },
    { "value": "shanghai-songjiang", "label": "松江区" },
    { "value": "shanghai-qingpu", "label": "青浦区" },
    { "value": "shanghai-fengxian", "label": "奉贤区" },
    { "value": "shanghai-jinshan", "label": "金山区" },
    { "value": "shanghai-chongming", "label": "崇明区" }
  ],
  "guangzhou": [
    { "value": "guangzhou-yuexiu", "label": "越秀区" },
    { "value": "guangzhou-hai Zhu", "label": "海珠区" },
    { "value": "guangzhou-liwan", "label": "荔湾区" },
    { "value": "guangzhou-tianhe", "label": "天河区" },
    { "value": "guangzhou-baiyun", "label": "白云区" },
    { "value": "guangzhou-panyu", "label": "番禺区" },
    { "value": "guangzhou-fanyu", "label": "番禺区" },
    { "value": "guangzhou-huadu", "label": "花都区" },
    { "value": "guangzhou-baogang", "label": "黄浦区" },
    { "value": "guangzhou-nansha", "label": "南沙区" },
    { "value": "guangzhou-zengcheng", "label": "增城区" },
    { "value": "guangzhou-conghua", "label": "从化区" }
  ],
  "shenzhen": [
    { "value": "shenzhen-nanshan", "label": "南山区" },
    { "value": "shenzhen-futian", "label": "福田区" },
    { "value": "shenzhen-luohu", "label": "罗湖区" },
    { "value": "shenzhen-yantian", "label": "盐田区" },
    { "value": "shenzhen-longgang", "label": "龙岗区" },
    { "value": "shenzhen-longhua", "label": "龙华区" },
    { "value": "shenzhen-pingshan", "label": "坪山区" },
    { "value": "shenzhen-baoan", "label": "宝安区" },
    { "value": "shenzhen-dapeng", "label": "大鹏新区" },
    { "value": "shenzhen-guangming", "label": "光明区" }
  ],
  "hangzhou": [
    { "value": "hangzhou-shangcheng", "label": "上城区" },
    { "value": "hangzhou-xihu", "label": "西湖区" },
    { "value": "hangzhou-gongshu", "label": "拱墅区" },
    { "value": "hangzhou-xiaoshan", "label": "萧山区" },
    { "value": "hangzhou-yuhang", "label": "余杭区" },
    { "value": "hangzhou-fuyang", "label": "富阳区" },
    { "value": "hangzhou-jiangnan", "label": "滨江区" },
    { "value": "hangzhou-linping", "label": "临平区" },
    { "value": "hangzhou-qiantang", "label": "钱塘区" },
    { "value": "hangzhou-linan", "label": "临安区" },
    { "value": "hangzhou-chun'an", "label": "淳安县" },
    { "value": "hangzhou-tonglu", "label": "桐庐县" },
    { "value": "hangzhou-jiande", "label": "建德市" }
  ],
  "nanjing": [
    { "value": "nanjing-jianye", "label": "建邺区" },
    { "value": "nanjing-xuanwu", "label": "玄武区" },
    { "value": "nanjing-gulou", "label": "鼓楼区" },
    { "value": "nanjing-qinhuai", "label": "秦淮区" },
    { "value": "nanjing-yuhuatai", "label": "雨花台区" },
    { "value": "nanjing-jiangning", "label": "江宁区" },
    { "value": "nanjing-pukou", "label": "浦口区" },
    { "value": "nanjing-lishui", "label": "溧水区" },
    { "value": "nanjing-gaochun", "label": "高淳区" },
    { "value": "nanjing-qixia", "label": "栖霞区" },
    { "value": "nanjingliuhe", "label": "六合区" }
  ],
  "wuhan": [
    { "value": "wuhan-jiang'an", "label": "江岸区" },
    { "value": "wuhan-jianghan", "label": "江汉区" },
    { "value": "wuhan-qiaokou", "label": "硚口区" },
    { "value": "wuhan-hanyang", "label": "汉阳区" },
    { "value": "wuhan-wuchang", "label": "武昌区" },
    { "value": "wuhan-qingshan", "label": "青山区" },
    { "value": "wuhan-hongshan", "label": "洪山区" },
    { "value": "wuhan-dongxihu", "label": "东西湖区" },
    { "value": "wuhan-huangpi", "label": "黄陂区" },
    { "value": "wuhan-xinzhou", "label": "新洲区" },
    { "value": "wuhan-caidian", "label": "蔡甸区" },
    { "value": "wuhan-jiangxia", "label": "江夏区" },
    { "value": "wuhan-hannan", "label": "汉南区" },
    { "value": "wuhan-donghuxinjiqu", "label": "东湖新技术开发区" }
  ],
  "chengdu": [
    { "value": "chengdu-jinjiang", "label": "锦江区" },
    { "value": "chengdu-qingyang", "label": "青羊区" },
    { "value": "chengdu-jingjiang", "label": "金牛区" },
    { "value": "chengdu-wuhou", "label": "武侯区" },
    { "value": "chengdu-chenghua", "label": "成华区" },
    { "value": "chengdu-longquanyi", "label": "龙泉驿区" },
    { "value": "chengdu-qingbaijiang", "label": "青白江区" },
    { "value": "chengdu-xindu", "label": "新都区" },
    { "value": "chengdu-wenjiang", "label": "温江区" },
    { "value": "chengdu-pidu", "label": "郫都区" },
    { "value": "chengdu-dujiangyan", "label": "都江堰市" },
    { "value": "chengdu-pengzhou", "label": "彭州市" },
    { "value": "chengdu-qionglai", "label": "邛崃市" },
    { "value": "chengdu-jianyang", "label": "简阳市" },
    { "value": "chengdu-chongzhou", "label": "崇州市" },
    { "value": "chengdu-dayi", "label": "大邑县" },
    { "value": "chengdu-pujiang", "label": "蒲江县" },
    { "value": "chengdu-xinjin", "label": "新津区" },
    { "value": "chengdu-shuangliu", "label": "双流区" },
    { "value": "chengdu-tianfuxinqu", "label": "天府新区" }
  ],
  "chongqing": [
    { "value": "chongqing-yuzhong", "label": "渝中区" },
    { "value": "chongqing-shapingba", "label": "沙坪坝区" },
    { "value": "chongqing-jiangbei", "label": "江北区" },
    { "value": "chongqing-jiulongpo", "label": "九龙坡区" },
    { "value": "chongqing-nanan", "label": "南岸区" },
    { "value": "chongqing-banan", "label": "巴南区" },
    { "value": "chongqing-yubei", "label": "渝北区" },
    { "value": "chongqing-beibei", "label": "北碚区" },
    { "value": "chongqing-fuling", "label": "涪陵区" },
    { "value": "chongqing-nanchuan", "label": "南川区" },
    { "value": "chongqing-wanzhou", "label": "万州区" },
    { "value": "chongqing-dadukou", "label": "大渡口区" },
    { "value": "chongqing-jiangjin", "label": "江津区" },
    { "value": "chongqing-hechuan", "label": "合川区" },
    { "value": "chongqing-yongchuan", "label": "永川区" },
    { "value": "chongqing-bishan", "label": "璧山区" },
    { "value": "chongqing-tongliang", "label": "铜梁区" },
    { "value": "chongqing-tongnan", "label": "潼南区" },
    { "value": "chongqing-rongchang", "label": "荣昌区" },
    { "value": "chongqing-qianjiang", "label": "黔江区" },
    { "value": "chongqing-wulong", "label": "武隆区" }
  ],
  "tianjin": [
    { "value": "tianjin-heping", "label": "和平区" },
    { "value": "tianjin-hexi", "label": "河西区" },
    { "value": "tianjin-hebei", "label": "河北区" },
    { "value": "tianjin-nankai", "label": "南开区" },
    { "value": "tianjin-he dong", "label": "河东区" },
    { "value": "tianjin-hongqiao", "label": "红桥区" },
    { "value": "tianjin-dongli", "label": "东丽区" },
    { "value": "tianjin-jinnan", "label": "津南区" },
    { "value": "tianjin-xiqing", "label": "西青区" },
    { "value": "tianjin-beichen", "label": "北辰区" },
    { "value": "tianjin-binhai", "label": "滨海新区" },
    { "value": "tianjin-ninghe", "label": "宁河区" },
    { "value": "tianjin-wuqing", "label": "武清区" },
    { "value": "tianjin-jizhou", "label": "蓟州区" },
    { "value": "tianjin-baodi", "label": "宝坻区" },
    { "value": "tianjin-jinghai", "label": "静海区" }
  ],
  "nanning": [
    { "value": "nanning-qingxiu", "label": "青秀区" },
    { "value": "nanning-jiangnan", "label": "江南区" },
    { "value": "nanning-xixiangtang", "label": "西乡塘区" },
    { "value": "nanning-liangqing", "label": "良庆区" },
    { "value": "nanning-yongning", "label": "邕宁区" },
    { "value": "nanning-wuming", "label": "武鸣区" },
    { "value": "nanning-longan", "label": "隆安县" },
    { "value": "nanning-mashan", "label": "马山县" },
    { "value": "nanning-shanglin", "label": "上林县" },
    { "value": "nanning-binyang", "label": "宾阳县" },
    { "value": "nanning-hengzhou", "label": "横州市" }
  ],
  "shijiazhuang": [
    { "value": "shijiazhuang-qiaoxi", "label": "桥西区" },
    { "value": "shijiazhuang-yuhua", "label": "裕华区" },
    { "value": "shijiazhuang-changan", "label": "长安区" },
    { "value": "shijiazhuang-qiaodong", "label": "桥东区" },
    { "value": "shijiazhuang-xinhua", "label": "新华区" },
    { "value": "shijiazhuang-gaocheng", "label": "藁城区" },
    { "value": "shijiazhuang-luquan", "label": "鹿泉区" },
    { "value": "shijiazhuang-huolu", "label": "栾城区" },
    { "value": "shijiazhuang-jingxingkuangqu", "label": "井陉矿区" },
    { "value": "shijiazhuang-zhengding", "label": "正定县" },
    { "value": "shijiazhuang-xingtang", "label": "行唐县" },
    { "value": "shijiazhuang-lingshou", "label": "灵寿县" },
    { "value": "shijiazhuang-gaoyi", "label": "高邑县" },
    { "value": "shijiazhuang-yuanshi", "label": "元氏县" },
    { "value": "shijiazhuang-zhaoxian", "label": "赵县" },
    { "value": "shijiazhuang-pingshan", "label": "平山县" },
    { "value": "shijiazhuang-jingxing", "label": "井陉县" },
    { "value": "shijiazhuang-xinle", "label": "新乐市" },
    { "value": "shijiazhuang-jinzhou", "label": "晋州市" },
    { "value": "shijiazhuang-shenze", "label": "深泽县" },
    { "value": "shijiazhuang-wuji", "label": "无极县" },
    { "value": "shijiazhuang-zanhuang", "label": "赞皇县" }
  ],
  "tangshan": [
    { "value": "tangshan-lubei", "label": "路北区" },
    { "value": "tangshan-lunan", "label": "路南区" },
    { "value": "tangshan-kaifaqu", "label": "高新技术产业开发区" },
    { "value": "tangshan-kaiping", "label": "开平区" },
    { "value": "tangshan-fengnan", "label": "丰南区" },
    { "value": "tangshan-fengrun", "label": "丰润区" },
    { "value": "tangshan-luanzhou", "label": "滦州市" },
    { "value": "tangshan-qianan", "label": "迁安市" },
    { "value": "tangshan-yutian", "label": "玉田县" },
    { "value": "tangshan-laoting", "label": "乐亭县" },
    { "value": "tangshan-luannan", "label": "滦南县" },
    { "value": "tangshan-qianxi", "label": "迁西县" },
    { "value": "tangshan-caofeidian", "label": "曹妃甸区" },
    { "value": "tangshan-zunhua", "label": "遵化市" }
  ],
  // 添加河北省其他城市
  "zhangjiakou": [
    { "value": "zhangjiakou-chongli", "label": "崇礼区" },
    { "value": "zhangjiakou-yanqing", "label": "延庆区" },
    { "value": "zhangjiakou-qiaoxi", "label": "桥西区" },
    { "value": "zhangjiakou-qiaodong", "label": "桥东区" },
    { "value": "zhangjiakou-xuanhua", "label": "宣化区" },
    { "value": "zhangjiakou-kangbao", "label": "康保县" },
    { "value": "zhangjiakou-xianghe", "label": "香河县" }
  ],
  "chengde": [
    { "value": "chengde-shuangqiao", "label": "双桥区" },
    { "value": "chengde-shuangluan", "label": "双滦区" },
    { "value": "chengde-pingquan", "label": "平泉市" },
    { "value": "chengde-luanping", "label": "滦平县" },
    { "value": "chengde-xianghe", "label": "香河县" }
  ],
  "qinhuangdao": [
    { "value": "qinhuangdao-haigang", "label": "海港区" },
    { "value": "qinhuangdao-shanhaiguan", "label": "山海关区" },
    { "value": "qinhuangdao-beidaihe", "label": "北戴河区" },
    { "value": "qinhuangdao抚宁", "label": "抚宁区" },
    { "value": "qinhuangdao-lulong", "label": "卢龙县" }
  ],
  "langfang": [
    { "value": "langfang-anhua", "label": "安次区" },
    { "value": "langfang-guangyang", "label": "广阳区" },
    { "value": "langfang-bazhou", "label": "霸州市" },
    { "value": "langfang-sanhe", "label": "三河市" },
    { "value": "langfang-xianghe", "label": "香河县" },
    { "value": "langfang-wugong", "label": "文安县" },
    { "value": "langfang-dacheng", "label": "大城县" },
    { "value": "langfang-gu'an", "label": "固安县" },
    { "value": "langfang-xiongxian", "label": "雄县" },
    { "value": "langfang-gaoyang", "label": "高阳县" }
  ],
  "cangzhou": [
    { "value": "cangzhou-yinghai", "label": "瀛海区" },
    { "value": "cangzhou-qingyun", "label": "青县" },
    { "value": "cangzhou-yanshan", "label": "盐山县" },
    { "value": "cangzhou-haixing", "label": "海兴县" },
    { "value": "cangzhou-mingguang", "label": "孟村回族自治县" },
    { "value": "cangzhou-nanpi", "label": "南皮县" },
    { "value": "cangzhou-suning", "label": "肃宁县" },
    { "value": "cangzhou-xianghe", "label": "香河县" }
  ],
  "hengshui": [
    { "value": "hengshui-taocheng", "label": "桃城区" },
    { "value": "hengshui-gaocheng", "label": "藁城区" },
    { "value": "hengshui-zaozhuang", "label": "枣强县" },
    { "value": "hengshui-wuyi", "label": "武邑县" },
    { "value": "hengshui-wuyue", "label": "武强县" },
    { "value": "hengshui-anping", "label": "安平县" },
    { "value": "hengshui-xianghe", "label": "香河县" }
  ],
  // 添加江苏省主要城市
  "suzhou": [
    { "value": "suzhou-gusu", "label": "姑苏区" },
    { "value": "suzhou-xiangcheng", "label": "相城区" },
    { "value": "suzhou-wuzhong", "label": "吴中区" },
    { "value": "suzhou-industrial", "label": "工业园区" },
    { "value": "suzhou-high-tech", "label": "高新技术" },
    { "value": "suzhou-changshu", "label": "常熟市" },
    { "value": "suzhou-zhangjiagang", "label": "张家港市" },
    { "value": "suzhou-kuangshan", "label": "昆山市" },
    { "value": "suzhou-taicang", "label": "太仓市" },
    { "value": "suzhou-wuxian", "label": "吴江区" }
  ],
  "wuxi": [
    { "value": "wuxi-chongan", "label": "崇安区" },
    { "value": "wuxi-nanchang", "label": "南长区" },
    { "value": "wuxi-beitang", "label": "北塘区" },
    { "value": "wuxi-xishan", "label": "锡山区" },
    { "value": "wuxi-huishan", "label": "惠山区" },
    { "value": "wuxi-binhu", "label": "滨湖区" },
    { "value": "wuxi-new-district", "label": "新区" },
    { "value": "wuxi-jiangyin", "label": "江阴市" },
    { "value": "wuxi-yixing", "label": "宜兴市" }
  ],
  // 添加浙江省主要城市
  "ningbo": [
    { "value": "ningbo-haishu", "label": "海曙区" },
    { "value": "ningbo-jiangdong", "label": "江东区" },
    { "value": "ningbo-jiangbei", "label": "江北区" },
    { "value": "ningbo-yingzhou", "label": "鄞州区" },
    { "value": "ningbo-beilun", "label": "北仑区" },
    { "value": "ningbo-zhenhai", "label": "镇海区" },
    { "value": "ningbo-yuyao", "label": "余姚市" },
    { "value": "ningbo-cixi", "label": "慈溪市" },
    { "value": "ningbo-fenghua", "label": "奉化区" },
    { "value": "ningbo-shengzhou", "label": "嵊州市" },
    { "value": "ningbo-xinchang", "label": "新昌县" }
  ],
  // 添加广东省主要城市
  "shenzhen": [
    { "value": "shenzhen-nanshan", "label": "南山区" },
    { "value": "shenzhen-futian", "label": "福田区" },
    { "value": "shenzhen-luohu", "label": "罗湖区" },
    { "value": "shenzhen-yantian", "label": "盐田区" },
    { "value": "shenzhen-longgang", "label": "龙岗区" },
    { "value": "shenzhen-longhua", "label": "龙华区" },
    { "value": "shenzhen-pingshan", "label": "坪山区" },
    { "value": "shenzhen-baoan", "label": "宝安区" },
    { "value": "shenzhen-dapeng", "label": "大鹏新区" },
    { "value": "shenzhen-guangming", "label": "光明区" }
  ],
  "dongguan": [
    { "value": "dongguan-dongcheng", "label": "东城区" },
    { "value": "dongguan-nancheng", "label": "南城区" },
    { "value": "dongguan-changan", "label": "长安镇" },
    { "value": "dongguan-dalang", "label": "大朗镇" },
    { "value": "dongguan-humen", "label": "虎门镇" },
    { "value": "dongguan-qingxi", "label": "清溪镇" },
    { "value": "dongguan-dongkeng", "label": "东坑镇" },
    { "value": "dongguan-wanjiang", "label": "万江区" }
  ],
  "foshan": [
    { "value": "foshan-chancheng", "label": "禅城区" },
    { "value": "foshan-nanhai", "label": "南海区" },
    { "value": "foshan-shunde", "label": "顺德区" },
    { "value": "foshan-gaoming", "label": "高明区" },
    { "value": "foshan Sanshui", "label": "三水区" }
  ],
  "jinan": [
    { "value": "jinan-shizhong", "label": "市中区" },
    { "value": "jinan-lixia", "label": "历下区" },
    { "value": "jinan-tianqiao", "label": "天桥区" },
    { "value": "jinan-linqing", "label": "临清市" },
    { "value": "jinan-zhangqiu", "label": "章丘区" },
    { "value": "jinan-jiyang", "label": "济阳区" },
    { "value": "jinan-pingyin", "label": "平阴县" },
    { "value": "jinan-longshan", "label": "龙山街道" },
    { "value": "jinan-honglou", "label": "红楼街道" },
    { "value": "jinan-xinglong", "label": "兴隆街道" }
  ],
  "qingdao": [
    { "value": "qingdao-shinan", "label": "市南区" },
    { "value": "qingdao-shibei", "label": "市北区" },
    { "value": "qingdao-lanshan", "label": "崂山区" },
    { "value": "qingdao-chengyang", "label": "城阳区" },
    { "value": "qingdao-chengyang", "label": "城阳区" },
    { "value": "qingdao-xiuzhou", "label": "胶州市" },
    { "value": "qingdao-pingdu", "label": "平度市" },
    { "value": "qingdao-laixi", "label": "莱西市" },
    { "value": "qingdao-jimo", "label": "即墨区" },
    { "value": "qingdao-kouan", "label": "崂山区" }
  ],
  "wuhan": [
    { "value": "wuhan-jianghan", "label": "江汉区" },
    { "value": "wuhan-jiangan", "label": "江岸区" },
    { "value": "wuhan-qiaokou", "label": "硚口区" },
    { "value": "wuhan-hanyang", "label": "汉阳区" },
    { "value": "wuhan-qingshan", "label": "青山区" },
    { "value": "wuhan-hongshan", "label": "洪山区" },
    { "value": "wuhan-dongxihu", "label": "东西湖区" },
    { "value": "wuhan-caidian", "label": "蔡甸区" },
    { "value": "wuhan-jiangxia", "label": "江夏区" },
    { "value": "wuhan-huangpi", "label": "黄陂区" },
    { "value": "wuhan-xinzhou", "label": "新洲区" },
    { "value": "wuhan-jiangcheng", "label": "江城区" },
    { "value": "wuhan-chengfeng", "label": "成丰县" },
    { "value": "wuhan-hanchuan", "label": "汉川市" },
    { "value": "wuhan-tianmen", "label": "天门市" },
    { "value": "wuhan-xiantao", "label": "仙桃市" }
  ],
  "xian": [
    { "value": "xian-beilin", "label": "碑林区" },
    { "value": "xian-xincheng", "label": "新城区" },
    { "value": "xian-wei yang", "label": "未央区" },
    { "value": "xian-yanta", "label": "雁塔区" },
    { "value": "xian-ba qiao", "label": "灞桥区" },
    { "value": "xian-weiyang", "label": "未央区" },
    { "value": "xian-chanba", "label": "浐灞生态区" },
    { "value": "xian-lintong", "label": "临潼区" },
    { "value": "xian-changan", "label": "长安区" },
    { "value": "xian-gaoling", "label": "高陵区" },
    { "value": "xian-huxian", "label": "户县" },
    { "value": "xian-chang-an", "label": "长安区" },
    { "value": "xian-lantian", "label": "蓝田县" },
    { "value": "xian-qinling", "label": "秦岭" },
    { "value": "xian-zhouzhi", "label": "周至县" },
    { "value": "xian-yanliang", "label": "阎良区" }
  ],
  "dalian": [
    { "value": "dalian-zhongshan", "label": "中市区" },
    { "value": "dalian-xigang", "label": "西岗区" },
    { "value": "dalian-shuangyashan", "label": "双鸭山市" },
    { "value": "dalian-shide", "label": "沙河口区" },
    { "value": "dalian-ganjingzi", "label": "甘井子区" },
    { "value": "dalian-lushunkou", "label": "旅顺口区" },
    { "value": "dalian-ganjingzi", "label": "甘井子区" },
    { "value": "dalian-kaifaqu", "label": "大连开发区" },
    { "value": "dalian-wafangdian", "label": "瓦房店市" },
    { "value": "dalian-zhoushuizi", "label": "周水子" }
  ],
  "xiamen": [
    { "value": "xiamen-siming", "label": "思明区" },
    { "value": "xiamen-huli", "label": "湖里区" },
    { "value": "xiamen-haicang", "label": "海沧区" },
    { "value": "xiamen-jiageng", "label": "嘉庚" },
    { "value": "xiamen-jiageng", "label": "集美区" },
    { "value": "xiamen-tong'an", "label": "同安区" },
    { "value": "xiamen-jimei", "label": "集美区" },
    { "value": "xiamen-xiang'an", "label": "翔安区" },
    { "value": "xiamen-zhangzhou", "label": "漳州港" }
  ],
  "changchun": [
    { "value": "changchun-nanguan", "label": "南关区" },
    { "value": "changchun-kuancheng", "label": "宽城区" },
    { "value": "changchun-chaoyang", "label": "朝阳区" },
    { "value": "changchun-luyuan", "label": "绿园区" },
    { "value": "changchun-kuancheng", "label": "宽城区" },
    { "value": "changchun-yitong", "label": "伊通满自治县" },
    { "value": "changchun-dehui", "label": "德惠市" },
    { "value": "changchun-gongzhuling", "label": "公主岭市" },
    { "value": "changchun-jiutai", "label": "九台区" },
    { "value": "changchun-yushu", "label": "榆树市" }
  ],
  "xianggang": [
    { "value": "xianggang-wanchai", "label": "湾仔区" },
    { "value": "xianggang-central", "label": "中西区" },
    { "value": "xianggang-sheungwan", "label": "上环" },
    { "value": "xianggang-admiralty", "label": "金钟" },
    { "value": "xianggang-tst", "label": "尖沙咀" },
    { "value": "xianggang-yauma-tei", "label": "油麻地" },
    { "value": "xianggang-mongkok", "label": "旺角" },
    { "value": "xianggang-kowloon-city", "label": "九龙城" },
    { "value": "xianggang-hung-hom", "label": "红磡" },
    { "value": "xianggang-sham-shui-po", "label": "深水埗" },
    { "value": "xianggang-yuen-long", "label": "元朗" },
    { "value": "xianggang-tuen-mun", "label": "屯门" },
    { "value": "xianggang-tsuen-wan", "label": "荃湾" },
    { "value": "xianggang-shatin", "label": "沙田" },
    { "value": "xianggang-kowloon-bay", "label": "九龙湾" },
    { "value": "xianggang-kwai-chung", "label": "葵涌" },
    { "value": "xianggang-cheung-chau", "label": "长洲" },
    { "value": "xianggang-lamma-island", "label": "南丫岛" }
  ],
  "aomen": [
    { "value": "aomen-peninsula", "label": "澳门半岛" },
    { "value": "aomen-taipa", "label": "氹仔岛" },
    { "value": "aomen-coloane", "label": "路环岛" },
    { "value": "aomen-cotai", "label": "路氹城" },
    { "value": "aomen-senado-square", "label": "议事亭前地" },
    { "value": "aomen-casino", "label": "赌场区" },
    { "value": "aomen-ruins-st-paul", "label": "大三巴牌坊" },
    { "value": "aomen-macau-tower", "label": "澳门塔" }
  ],
  "taiwan": [
    { "value": "taiwan-taipei", "label": "台北市" },
    { "value": "taiwan-newtaipei", "label": "新北市" },
    { "value": "taiwan-taoyuan", "label": "桃园市" },
    { "value": "taiwan-taichung", "label": "台中市" },
    { "value": "taiwan-tainan", "label": "台南市" },
    { "value": "taiwan-kaohsiung", "label": "高雄市" },
    { "value": "taiwan-kinmen", "label": "金门县" },
    { "value": "taiwan-penghu", "label": "澎湖县" },
    { "value": "taiwan-lienchiang", "label": "连江县" },
    { "value": "taiwan-hsinchu", "label": "新竹市" },
    { "value": "taiwan-hsinchu-county", "label": "新竹县" },
    { "value": "taiwan-chiayi", "label": "嘉义市" },
    { "value": "taiwan-chiayi-county", "label": "嘉义县" },
    { "value": "taiwan-yilan", "label": "宜兰县" },
    { "value": "taiwan-hualien", "label": "花莲县" },
    { "value": "taiwan-taitung", "label": "台东县" },
    { "value": "taiwan-nantou", "label": "南投县" },
    { "value": "taiwan-miaoli", "label": "苗栗县" },
    { "value": "taiwan-yunlin", "label": "云林县" }
  ]
};

// 城市名称映射表（处理不同写法或别名）
const cityNameMappings = {
  // 直接别名映射
  "beijing": ["北京", "北京市"],
  "shanghai": ["上海", "上海市"],
  "guangzhou": ["广州", "广州市"],
  "shenzhen": ["深圳", "深圳市"],
  "hangzhou": ["杭州", "杭州市"],
  "nanjing": ["南京", "南京市"],
  "wuhan": ["武汉", "武汉市"],
  "chengdu": ["成都", "成都市"],
  "chongqing": ["重庆", "重庆市"],
  "tianjin": ["天津", "天津市"],
  "nanning": ["南宁", "南宁市"],
  "shijiazhuang": ["石家庄", "石家庄市"],
  "tangshan": ["唐山", "唐山市"],
  "zhangjiakou": ["张家口", "张家口市"],
  "chengde": ["承德", "承德市"],
  "qinhuangdao": ["秦皇岛", "秦皇岛市"],
  "langfang": ["廊坊", "廊坊市"],
  "cangzhou": ["沧州", "沧州市"],
  "hengshui": ["衡水", "衡水市"],
  "suzhou": ["苏州", "苏州市"],
  "wuxi": ["无锡", "无锡市"],
  "ningbo": ["宁波", "宁波市"],
  "dongguan": ["东莞", "东莞市"],
  "foshan": ["佛山", "佛山市"],
  "jinan": ["济南", "济南市"],
  "qingdao": ["青岛", "青岛市"],
  "xian": ["西安", "西安市"],
  "dalian": ["大连", "大连市"],
  "xiamen": ["厦门", "厦门市"],
  "changchun": ["长春", "长春市"],
  
  // 特殊映射和纠正
  "shijiazhuang": ["石家庄", "石家庄市", "石市"],
  "shenzhen": ["深圳", "深圳市", "深州"],
  "hangzhou": ["杭州", "杭州市", "杭州城"],
  "ningbo": ["宁波", "宁波市", "甬城"],
  "wuhan": ["武汉", "武汉市", "江城"],
  "chengdu": ["成都", "成都市", "蓉城"],
  "chongqing": ["重庆", "重庆市", "山城"],
  "guangzhou": ["广州", "广州市", "羊城"],
  "xian": ["西安", "西安市", "长安", "镐京"]
};

// 辅助函数：获取城市的基础值（去除省份前缀）
function getCityBaseValue(cityValue) {
  const parts = cityValue.split('-');
  if (parts.length === 1) {
    return parts[0]; // 如 'beijing', 'shanghai'
  }
  // 去除省份前缀，如 'hebei-shijiazhuang' -> 'shijiazhuang'
  return parts[parts.length - 1];
}

// 辅助函数：城市名称匹配（支持模糊匹配）
function findMatchingCityKey(cityValue, provinceValue) {
  // 直接匹配基础值
  const cityBaseValue = getCityBaseValue(cityValue);
  if (officialDistrictData[cityBaseValue]) {
    return cityBaseValue;
  }

  // 匹配带省份前缀的键
  const provinceCityKey = `${provinceValue}-${cityBaseValue}`;
  if (officialDistrictData[provinceCityKey]) {
    return provinceCityKey;
  }

  // 使用城市名称映射表匹配
  for (const [cityKey, aliases] of Object.entries(cityNameMappings)) {
    // 检查城市值是否在别名列表中
    if (aliases.includes(cityValue) || aliases.includes(cityBaseValue)) {
      if (officialDistrictData[cityKey]) {
        return cityKey;
      }
    }
  }

  // 近似匹配（处理拼写错误或变体）
  const normalizedCityValue = cityBaseValue.toLowerCase().replace(/\s+/g, '');
  for (const cityKey of Object.keys(officialDistrictData)) {
    const normalizedCityKey = cityKey.toLowerCase().replace(/\s+/g, '');
    // 检查是否有相似的拼写
    if (normalizedCityValue === normalizedCityKey) {
      return cityKey;
    }
    // 简单的编辑距离检查（用于小错误）
    if (levenshteinDistance(normalizedCityValue, normalizedCityKey) <= 2) {
      return cityKey;
    }
  }

  return null; // 无匹配
}

// 辅助函数：计算Levenshtein距离（用于近似匹配）
function levenshteinDistance(a, b) {
  const matrix = [];

  // 初始化第一行和第一列
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          Math.min(matrix[i][j - 1] + 1, // 插入
                  matrix[i - 1][j] + 1) // 删除
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// 辅助函数：补全区县数据
function completeDistrictsForCity(cityData, cityKey) {
  if (!officialDistrictData[cityKey]) {
    return cityData; // 无官方数据则保持原样
  }

  // 保留现有区县，仅添加缺失的
  const existingDistricts = new Set(
    (cityData.children || []).map(district => district.value)
  );

  const updatedDistricts = [...(cityData.children || [])];

  // 添加缺失的区县
  officialDistrictData[cityKey].forEach(district => {
    if (!existingDistricts.has(district.value)) {
      updatedDistricts.push({
        ...district,
        children: []
      });
    }
  });

  return {
    ...cityData,
    children: updatedDistricts
  };
}

// 辅助函数：补全所有城市的区县数据
function completeDistricts(addressData) {
  return addressData.map(province => {
    if (!province.children) {
      return province;
    }

    const updatedCities = province.children.map(city => {
      // 获取省份值
      const provinceValue = province.value;
      
      // 查找匹配的城市键
      const cityKey = findMatchingCityKey(city.value, provinceValue);
      
      if (cityKey) {
        return completeDistrictsForCity(city, cityKey);
      }

      return city; // 无匹配数据则保持原样
    });

    return {
      ...province,
      children: updatedCities
    };
  });
}

// 导出模块内容
export {
  officialDistrictData,
  cityNameMappings,
  getCityBaseValue,
  findMatchingCityKey,
  levenshteinDistance,
  completeDistrictsForCity,
  completeDistricts
};

// 主函数
function main() {
  const currentAddressDataPath = path.join(__dirname, 'addressData.ts');
  
  try {
    // 读取现有数据
    const fileContent = fs.readFileSync(currentAddressDataPath, 'utf8');
    
    // 提取 JSON 数据部分
    const jsonStart = fileContent.indexOf('[');
    const jsonEnd = fileContent.lastIndexOf(']');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('无法找到JSON数据部分');
    }
    
    const jsonData = fileContent.substring(jsonStart, jsonEnd + 1);
    let addressData = JSON.parse(jsonData);

    // 创建备份
    const backupFileName = `addressData_backup_${Date.now()}_districts.ts`;
    const backupPath = path.join(__dirname, backupFileName);
    fs.writeFileSync(backupPath, fileContent, 'utf8');
    console.log(`已创建数据备份: ${backupFileName}`);

    // 补全区县数据
    const updatedAddressData = completeDistricts(addressData);

    // 生成新的文件内容
    const newContent = `const completeAddressData = ${JSON.stringify(updatedAddressData, null, 2)};

export default completeAddressData;`;

    // 写入更新后的数据
    fs.writeFileSync(currentAddressDataPath, newContent, 'utf8');
    console.log('区县数据补全完成！');
    
    // 输出统计信息
    updatedAddressData.forEach(province => {
      if (province.children) {
        const provinceName = province.label;
        const cityCount = province.children.length;
        const districtStats = province.children
          .map(city => `${city.label}: ${city.children?.length || 0}个区县`)
          .filter(stat => stat.includes(': 0') === false)
          .join('\n  ');
        
        if (districtStats) {
          console.log(`\n${provinceName} (${cityCount}个城市):`);
          console.log(`  ${districtStats}`);
        }
      }
    });

  } catch (error) {
    console.error('处理过程中出现错误:', error.message);
    console.error(error.stack);
  }
}

// 执行主函数
main();