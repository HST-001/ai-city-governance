// 补全省份城市数据脚本
// 功能：为现有地址数据补全各省份的城市信息，保持现有正确数据不变

import fs from 'fs';
import path from 'path';

// 定义完整的省份城市数据
const provinceCityData = {
  // 北京市：直辖市，已有详细数据，无需补充
  beijing: [],
  
  // 天津市：直辖市，补充完整区县
  tianjin: [
    { "value": "tianjin-heping", "label": "和平区", "children": [] },
    { "value": "tianjin-hexi", "label": "河西区", "children": [] },
    { "value": "tianjin-hebe", "label": "河北区", "children": [] },
    { "value": "tianjin-nankai", "label": "南开区", "children": [] },
    { "value": "tianjin-hedong", "label": "河东区", "children": [] },
    { "value": "tianjin-hongqiao", "label": "红桥区", "children": [] },
    { "value": "tianjin-dongli", "label": "东丽区", "children": [] },
    { "value": "tianjin-hexi-2", "label": "西青区", "children": [] },
    { "value": "tianjin-nanhe", "label": "津南区", "children": [] },
    { "value": "tianjin-beichen", "label": "北辰区", "children": [] },
    { "value": "tianjin-wuqing", "label": "武清区", "children": [] },
    { "value": "tianjin-宝坻区", "label": "宝坻区", "children": [] },
    { "value": "tianjin-宁河区", "label": "宁河区", "children": [] },
    { "value": "tianjin-静海区", "label": "静海区", "children": [] },
    { "value": "tianjin-蓟州区", "label": "蓟州区", "children": [] }
  ],
  
  // 上海市：直辖市，已有详细数据，无需补充
  shanghai: [],
  
  // 重庆市：直辖市，补充区县
  chongqing: [
    { "value": "chongqing-yuzhong", "label": "渝中区", "children": [] },
    { "value": "chongqing-jiangbei", "label": "江北区", "children": [] },
    { "value": "chongqing-nan'an", "label": "南岸区", "children": [] },
    { "value": "chongqing-shapingba", "label": "沙坪坝区", "children": [] },
    { "value": "chongqing-jiulongpo", "label": "九龙坡区", "children": [] },
    { "value": "chongqing-yubei", "label": "渝北区", "children": [] },
    { "value": "chongqing-banan", "label": "巴南区", "children": [] },
    { "value": "chongqing-万盛经开区", "label": "万盛经开区", "children": [] },
    { "value": "chongqing-dadukou", "label": "大渡口区", "children": [] },
    { "value": "chongqing-fuling", "label": "涪陵区", "children": [] },
    { "value": "chongqing-jiangjin", "label": "江津区", "children": [] },
    { "value": "chongqing-qijiang", "label": "綦江区", "children": [] },
    { "value": "chongqing-tongnan", "label": "潼南区", "children": [] },
    { "value": "chongqing-tongliang", "label": "铜梁区", "children": [] },
    { "value": "chongqing-yongchuan", "label": "永川区", "children": [] },
    { "value": "chongqing-rongchang", "label": "荣昌区", "children": [] },
    { "value": "chongqing-hechuan", "label": "合川区", "children": [] },
    { "value": "chongqing-ningjiang", "label": "黔江区", "children": [] },
    { "value": "chongqing-nanchuan", "label": "南川区", "children": [] },
    { "value": "chongqing-beibei", "label": "北碚区", "children": [] },
    { "value": "chongqing-长寿区", "label": "长寿区", "children": [] },
    { "value": "chongqing-dianjiang", "label": "垫江县", "children": [] },
    { "value": "chongqing-wulong", "label": "武隆区", "children": [] },
    { "value": "chongqing-fengjie", "label": "奉节县", "children": [] },
    { "value": "chongqing-kaizhou", "label": "开州区", "children": [] },
    { "value": "chongqing-城口县", "label": "城口县", "children": [] },
    { "value": "chongqing-云阳县", "label": "云阳县", "children": [] },
    { "value": "chongqing-忠县", "label": "忠县", "children": [] },
    { "value": "chongqing-巫溪县", "label": "巫溪县", "children": [] },
    { "value": "chongqing-巫山县", "label": "巫山县", "children": [] },
    { "value": "chongqing-石柱县", "label": "石柱土家族自治县", "children": [] },
    { "value": "chongqing-秀山县", "label": "秀山土家族苗族自治县", "children": [] },
    { "value": "chongqing-酉阳县", "label": "酉阳土家族苗族自治县", "children": [] },
    { "value": "chongqing-彭水县", "label": "彭水苗族土家族自治县", "children": [] }
  ],
  
  // 河北省：补充主要城市
  hebei: [
    { "value": "hebei-shijiazhuang", "label": "石家庄市", "children": [] },
    { "value": "hebei-tangshan", "label": "唐山市", "children": [] },
    { "value": "hebei-zhangjiakou", "label": "张家口市", "children": [] },
    { "value": "hebei-chengde", "label": "承德市", "children": [] },
    { "value": "hebei-qinhuangdao", "label": "秦皇岛市", "children": [] },
    { "value": "hebei-langfang", "label": "廊坊市", "children": [] },
    { "value": "hebei-cangzhou", "label": "沧州市", "children": [] },
    { "value": "hebei-衡水", "label": "衡水市", "children": [] },
    { "value": "hebei-xingtai", "label": "邢台市", "children": [] },
    { "value": "hebei-handan", "label": "邯郸市", "children": [] },
    { "value": "hebei-baoding", "label": "保定市", "children": [] }
  ],
  
  // 山西省：补充主要城市
  shanxi: [
    { "value": "shanxi-taiyuan", "label": "太原市", "children": [] },
    { "value": "shanxi-datong", "label": "大同市", "children": [] },
    { "value": "shanxi-yangquan", "label": "阳泉市", "children": [] },
    { "value": "shanxi-changzhi", "label": "长治市", "children": [] },
    { "value": "shanxi-jinchang", "label": "晋城市", "children": [] },
    { "value": "shanxi-shuozhou", "label": "朔州市", "children": [] },
    { "value": "shanxi-jinzhong", "label": "晋中市", "children": [] },
    { "value": "shanxi-yuncheng", "label": "运城市", "children": [] },
    { "value": "shanxi-xinzhou", "label": "忻州市", "children": [] },
    { "value": "shanxi-linfen", "label": "临汾市", "children": [] },
    { "value": "shanxi-lyuliang", "label": "吕梁市", "children": [] }
  ],
  
  // 辽宁省：补充主要城市
  liaoning: [
    { "value": "liaoning-shenyang", "label": "沈阳市", "children": [] },
    { "value": "liaoning-dalian", "label": "大连市", "children": [] },
    { "value": "liaoning-anshan", "label": "鞍山市", "children": [] },
    { "value": "liaoning-fushun", "label": "抚顺市", "children": [] },
    { "value": "liaoning-benxi", "label": "本溪市", "children": [] },
    { "value": "liaoning-dandong", "label": "丹东市", "children": [] },
    { "value": "liaoning-jinzhou", "label": "锦州市", "children": [] },
    { "value": "liaoning-yingkou", "label": "营口市", "children": [] },
    { "value": "liaoning-fuxin", "label": "阜新市", "children": [] },
    { "value": "liaoning-liaoyang", "label": "辽阳市", "children": [] },
    { "value": "liaoning-panjin", "label": "盘锦市", "children": [] },
    { "value": "liaoning-tieling", "label": "铁岭市", "children": [] },
    { "value": "liaoning-changtu", "label": "朝阳市", "children": [] },
    { "value": "liaoning-huludao", "label": "葫芦岛市", "children": [] }
  ],
  
  // 吉林省：补充主要城市
  jilin: [
    { "value": "jilin-changchun", "label": "长春市", "children": [] },
    { "value": "jilin-jilin", "label": "吉林市", "children": [] },
    { "value": "jilin-siping", "label": "四平市", "children": [] },
    { "value": "jilin-liaoyuan", "label": "辽源市", "children": [] },
    { "value": "jilin-tonghua", "label": "通化市", "children": [] },
    { "value": "jilin-baishan", "label": "白山市", "children": [] },
    { "value": "jilin-songyuan", "label": "松原市", "children": [] },
    { "value": "jilin-baicheng", "label": "白城市", "children": [] },
    { "value": "jilin-yanbian", "label": "延边朝鲜族自治州", "children": [] }
  ],
  
  // 黑龙江省：补充主要城市
  heilongjiang: [
    { "value": "heilongjiang-harbin", "label": "哈尔滨市", "children": [] },
    { "value": "heilongjiang-qiqihaer", "label": "齐齐哈尔市", "children": [] },
    { "value": "heilongjiang-jixi", "label": "鸡西市", "children": [] },
    { "value": "heilongjiang-hegang", "label": "鹤岗市", "children": [] },
    { "value": "heilongjiang-shuangyashan", "label": "双鸭山市", "children": [] },
    { "value": "heilongjiang-daxinganling", "label": "大兴安岭地区", "children": [] },
    { "value": "heilongjiang-yingchun", "label": "伊春市", "children": [] },
    { "value": "heilongjiang-jiamusi", "label": "佳木斯市", "children": [] },
    { "value": "heilongjiang-qitaihe", "label": "七台河市", "children": [] },
    { "value": "heilongjiang-mudanjiang", "label": "牡丹江市", "children": [] },
    { "value": "heilongjiang-heihe", "label": "黑河市", "children": [] },
    { "value": "heilongjiang-suihua", "label": "绥化市", "children": [] }
  ],
  
  // 江苏省：已有部分数据，补充完整
  jiangsu: [
    { "value": "jiangsu-nanjing", "label": "南京市", "children": [] },
    { "value": "jiangsu-wuxi", "label": "无锡市", "children": [] },
    { "value": "jiangsu-xuzhou", "label": "徐州市", "children": [] },
    { "value": "jiangsu-changzhou", "label": "常州市", "children": [] },
    { "value": "jiangsu-suzhou", "label": "苏州市", "children": [] },
    { "value": "jiangsu-nantong", "label": "南通市", "children": [] },
    { "value": "jiangsu-lianyungang", "label": "连云港市", "children": [] },
    { "value": "jiangsu-huaian", "label": "淮安市", "children": [] },
    { "value": "jiangsu-yancheng", "label": "盐城市", "children": [] },
    { "value": "jiangsu-yanzhou", "label": "扬州市", "children": [] },
    { "value": "jiangsu-zaozhuang", "label": "镇江市", "children": [] },
    { "value": "jiangsu-taizhou", "label": "泰州市", "children": [] },
    { "value": "jiangsu-suqian", "label": "宿迁市", "children": [] }
  ],
  
  // 浙江省：已有部分数据，补充完整
  zhejiang: [
    { "value": "zhejiang-hangzhou", "label": "杭州市", "children": [] },
    { "value": "zhejiang-ningsbo", "label": "宁波市", "children": [] },
    { "value": "zhejiang-wenzhou", "label": "温州市", "children": [] },
    { "value": "zhejiang-jiaxing", "label": "嘉兴市", "children": [] },
    { "value": "zhejiang-huzhou", "label": "湖州市", "children": [] },
    { "value": "zhejiang-shaoxing", "label": "绍兴市", "children": [] },
    { "value": "zhejiang-quzhou", "label": "衢州市", "children": [] },
    { "value": "zhejiang-zhoushan", "label": "舟山市", "children": [] },
    { "value": "zhejiang-taizhou", "label": "台州市", "children": [] },
    { "value": "zhejiang-lishui", "label": "丽水市", "children": [] }
  ],
  
  // 安徽省：补充主要城市
  anhui: [
    { "value": "anhui-hefei", "label": "合肥市", "children": [] },
    { "value": "anhui-wuhu", "label": "芜湖市", "children": [] },
    { "value": "anhui-bengbu", "label": "蚌埠市", "children": [] },
    { "value": "anhui-huainan", "label": "淮南市", "children": [] },
    { "value": "anhui-maanshan", "label": "马鞍山市", "children": [] },
    { "value": "anhui-huaibei", "label": "淮北市", "children": [] },
    { "value": "anhui-tongling", "label": "铜陵市", "children": [] },
    { "value": "anhui-anqing", "label": "安庆市", "children": [] },
    { "value": "anhui-chuzhou", "label": "滁州市", "children": [] },
    { "value": "anhui-fuyang", "label": "阜阳市", "children": [] },
    { "value": "anhui-suzhou", "label": "宿州市", "children": [] },
    { "value": "anhui-lu'an", "label": "六安市", "children": [] },
    { "value": "anhui-bozhou", "label": "亳州市", "children": [] },
    { "value": "anhui-chaohu", "label": "池州市", "children": [] },
    { "value": "anhui-chizhou", "label": "宣城市", "children": [] }
  ],
  
  // 福建省：补充主要城市
  fujian: [
    { "value": "fujian-fuzhou", "label": "福州市", "children": [] },
    { "value": "fujian-xiamen", "label": "厦门市", "children": [] },
    { "value": "fujian-putian", "label": "莆田市", "children": [] },
    { "value": "fujian-sanming", "label": "三明市", "children": [] },
    { "value": "fujian-quanzhou", "label": "泉州市", "children": [] },
    { "value": "fujian-zhangzhou", "label": "漳州市", "children": [] },
    { "value": "fujian-nanping", "label": "南平市", "children": [] },
    { "value": "fujian-longyan", "label": "龙岩市", "children": [] },
    { "value": "fujian-ningde", "label": "宁德市", "children": [] }
  ],
  
  // 江西省：补充主要城市
  jiangxi: [
    { "value": "jiangxi-nanchang", "label": "南昌市", "children": [] },
    { "value": "jiangxi-jiujiang", "label": "九江市", "children": [] },
    { "value": "jiangxi-pingxiang", "label": "萍乡市", "children": [] },
    { "value": "jiangxi-ji'an", "label": "吉安市", "children": [] },
    { "value": "jiangxi-xinyu", "label": "新余市", "children": [] },
    { "value": "jiangxi-yichun", "label": "宜春市", "children": [] },
    { "value": "jiangxi-fuzhou", "label": "抚州市", "children": [] },
    { "value": "jiangxi-shangrao", "label": "上饶市", "children": [] },
    { "value": "jiangxi-gannan", "label": "赣州市", "children": [] },
    { "value": "jiangxi-yingtan", "label": "鹰潭市", "children": [] },
    { "value": "jiangxi-jingdezhen", "label": "景德镇市", "children": [] }
  ],
  
  // 山东省：补充主要城市
  shandong: [
    { "value": "shandong-jinan", "label": "济南市", "children": [] },
    { "value": "shandong-qingdao", "label": "青岛市", "children": [] },
    { "value": "shandong-zibo", "label": "淄博市", "children": [] },
    { "value": "shandong-zaozhuang", "label": "枣庄市", "children": [] },
    { "value": "shandong-dongying", "label": "东营市", "children": [] },
    { "value": "shandong-yantai", "label": "烟台市", "children": [] },
    { "value": "shandong-weifang", "label": "潍坊市", "children": [] },
    { "value": "shandong-jining", "label": "济宁市", "children": [] },
    { "value": "shandong-taian", "label": "泰安市", "children": [] },
    { "value": "shandong-weihai", "label": "威海市", "children": [] },
    { "value": "shandong-rizhao", "label": "日照市", "children": [] },
    { "value": "shandong-liaocheng", "label": "聊城市", "children": [] },
    { "value": "shandong-dezhou", "label": "德州市", "children": [] },
    { "value": "shandong-binzhou", "label": "滨州市", "children": [] },
    { "value": "shandong-heze", "label": "菏泽市", "children": [] },
    { "value": "shandong-linyi", "label": "临沂市", "children": [] }
  ],
  
  // 河南省：补充主要城市
  henan: [
    { "value": "henan-zhengzhou", "label": "郑州市", "children": [] },
    { "value": "henan-kaifeng", "label": "开封市", "children": [] },
    { "value": "henan-luoyang", "label": "洛阳市", "children": [] },
    { "value": "henan-pingdingshan", "label": "平顶山市", "children": [] },
    { "value": "henan-anyang", "label": "安阳市", "children": [] },
    { "value": "henan-hebi", "label": "鹤壁市", "children": [] },
    { "value": "henan-xinxiang", "label": "新乡市", "children": [] },
    { "value": "henan-jiaozuo", "label": "焦作市", "children": [] },
    { "value": "henan-puyang", "label": "濮阳市", "children": [] },
    { "value": "henan-xuchang", "label": "许昌市", "children": [] },
    { "value": "henan-luohe", "label": "漯河市", "children": [] },
    { "value": "henan-sanmenxia", "label": "三门峡市", "children": [] },
    { "value": "henan-nanyang", "label": "南阳市", "children": [] },
    { "value": "henan-shangqiu", "label": "商丘市", "children": [] },
    { "value": "henan-xinyang", "label": "信阳市", "children": [] },
    { "value": "henan-zhoukou", "label": "周口市", "children": [] },
    { "value": "henan-zhumadian", "label": "驻马店市", "children": [] },
    { "value": "henan-jiyuan", "label": "济源市", "children": [] }
  ],
  
  // 湖北省：补充主要城市
  hubei: [
    { "value": "hubei-wuhan", "label": "武汉市", "children": [] },
    { "value": "hubei-huangshi", "label": "黄石市", "children": [] },
    { "value": "hubei-shiyan", "label": "十堰市", "children": [] },
    { "value": "hubei-yichang", "label": "宜昌市", "children": [] },
    { "value": "hubei-xiangyang", "label": "襄阳市", "children": [] },
    { "value": "hubei-ezhou", "label": "鄂州市", "children": [] },
    { "value": "hubei-jingmen", "label": "荆门市", "children": [] },
    { "value": "hubei-xiaogan", "label": "孝感市", "children": [] },
    { "value": "hubei-jingzhou", "label": "荆州市", "children": [] },
    { "value": "hubei-yangtze", "label": "黄冈市", "children": [] },
    { "value": "hubei-huanggang", "label": "咸宁市", "children": [] },
    { "value": "hubei-suizhou", "label": "随州市", "children": [] },
    { "value": "hubei-xiantao", "label": "仙桃市", "children": [] },
    { "value": "hubei-qianjiang", "label": "潜江市", "children": [] },
    { "value": "hubei-tianmen", "label": "天门市", "children": [] },
    { "value": "hubei-enshi", "label": "恩施土家族苗族自治州", "children": [] },
    { "value": "hubei-shennongjia", "label": "神农架林区", "children": [] }
  ],
  
  // 湖南省：补充主要城市
  hunan: [
    { "value": "hunan-changsha", "label": "长沙市", "children": [] },
    { "value": "hunan-zhuzhou", "label": "株洲市", "children": [] },
    { "value": "hunan-xiangtan", "label": "湘潭市", "children": [] },
    { "value": "hunan-hengyang", "label": "衡阳市", "children": [] },
    { "value": "hunan-shaoyang", "label": "邵阳市", "children": [] },
    { "value": "hunan-yueyang", "label": "岳阳市", "children": [] },
    { "value": "hunan-zhangjiajie", "label": "张家界市", "children": [] },
    { "value": "hunan-yiayang", "label": "益阳市", "children": [] },
    { "value": "hunan-chenzhou", "label": "郴州市", "children": [] },
    { "value": "hunan- Yongzhou", "label": "永州市", "children": [] },
    { "value": "hunan-huaihua", "label": "怀化市", "children": [] },
    { "value": "hunan-loudi", "label": "娄底市", "children": [] },
    { "value": "hunan-xiangxi", "label": "湘西土家族苗族自治州", "children": [] }
  ],
  
  // 广东省：修复现有数据结构问题，补充完整城市
  guangdong: [
    { "value": "guangdong-guangzhou", "label": "广州市", "children": [] },
    { "value": "guangdong-shenzhen", "label": "深圳市", "children": [] },
    { "value": "guangdong-zhuhai", "label": "珠海市", "children": [] },
    { "value": "guangdong-shantou", "label": "汕头市", "children": [] },
    { "value": "guangdong-foshan", "label": "佛山市", "children": [] },
    { "value": "guangdong-jiangmen", "label": "江门市", "children": [] },
    { "value": "guangdong-zhanjiang", "label": "湛江市", "children": [] },
    { "value": "guangdong-maoming", "label": "茂名市", "children": [] },
    { "value": "guangdong- Zhaoqing", "label": "肇庆市", "children": [] },
    { "value": "guangdong-huizhou", "label": "惠州市", "children": [] },
    { "value": "guangdong-shaoguan", "label": "韶关市", "children": [] },
    { "value": "guangdong-meizhou", "label": "梅州市", "children": [] },
    { "value": "guangdong-shanwei", "label": "汕尾市", "children": [] },
    { "value": "guangdong-heyuan", "label": "河源市", "children": [] },
    { "value": "guangdong-yingde", "label": "阳江市", "children": [] },
    { "value": "guangdong-qingyuan", "label": "清远市", "children": [] },
    { "value": "guangdong-dongguan", "label": "东莞市", "children": [] },
    { "value": "guangdong-zhongshan", "label": "中山市", "children": [] },
    { "value": "guangdong-chaozhou", "label": "潮州市", "children": [] },
    { "value": "guangdong- Jieyang", "label": "揭阳市", "children": [] },
    { "value": "guangdong-yunfu", "label": "云浮市", "children": [] }
  ],
  
  // 广西壮族自治区：补充主要城市
  guangxi: [
    { "value": "guangxi-nanning", "label": "南宁市", "children": [] },
    { "value": "guangxi-liuzhou", "label": "柳州市", "children": [] },
    { "value": "guangxi-guilin", "label": "桂林市", "children": [] },
    { "value": "guangxi-wuzhou", "label": "梧州市", "children": [] },
    { "value": "guangxi-beihai", "label": "北海市", "children": [] },
    { "value": "guangxi-fangchenggang", "label": "防城港市", "children": [] },
    { "value": "guangxi-qinzhou", "label": "钦州市", "children": [] },
    { "value": "guangxi-guigang", "label": "贵港市", "children": [] },
    { "value": "guangxi-yulin", "label": "玉林市", "children": [] },
    { "value": "guangxi-baise", "label": "百色市", "children": [] },
    { "value": "guangxi-hezhou", "label": "贺州市", "children": [] },
    { "value": "guangxi-hechi", "label": "河池市", "children": [] },
    { "value": "guangxi-laibin", "label": "来宾市", "children": [] },
    { "value": "guangxi-chongzuo", "label": "崇左市", "children": [] }
  ],
  
  // 海南省：补充主要城市
  hainan: [
    { "value": "hainan-haikou", "label": "海口市", "children": [] },
    { "value": "hainan-sanya", "label": "三亚市", "children": [] },
    { "value": "hainan-sanjiangyuan", "label": "三沙市", "children": [] },
    { "value": "hainan-dongfang", "label": "儋州市", "children": [] },
    { "value": "hainan-wuzhishan", "label": "五指山市", "children": [] },
    { "value": "hainan-dingan", "label": "定安县", "children": [] },
    { "value": "hainan-dongfang", "label": "东方市", "children": [] },
    { "value": "hainan-chengmai", "label": "澄迈县", "children": [] },
    { "value": "hainan-dongshan", "label": "屯昌县", "children": [] },
    { "value": "hainan-lingshui", "label": "陵水黎族自治县", "children": [] },
    { "value": "hainan-baoting", "label": "保亭黎族苗族自治县", "children": [] },
    { "value": "hainan-chenzhou", "label": "琼中黎族苗族自治县", "children": [] },
    { "value": "hainan-qionghai", "label": "琼海市", "children": [] },
    { "value": "hainan-wanning", "label": "万宁市", "children": [] },
    { "value": "hainan-文昌市", "label": "文昌市", "children": [] },
    { "value": "hainan-白沙县", "label": "白沙黎族自治县", "children": [] },
    { "value": "hainan-changjiang", "label": "昌江黎族自治县", "children": [] }
  ],
  
  // 四川省：补充主要城市
  sichuan: [
    { "value": "sichuan-chengdu", "label": "成都市", "children": [] },
    { "value": "sichuan-zigong", "label": "自贡市", "children": [] },
    { "value": "sichuan-panzhihua", "label": "攀枝花市", "children": [] },
    { "value": "sichuan-luzhou", "label": "泸州市", "children": [] },
    { "value": "sichuan-deyang", "label": "德阳市", "children": [] },
    { "value": "sichuan-mianyang", "label": "绵阳市", "children": [] },
    { "value": "sichuan-guangyuan", "label": "广元市", "children": [] },
    { "value": "sichuan-suzhou", "label": "遂宁市", "children": [] },
    { "value": "sichuan-neijiang", "label": "内江市", "children": [] },
    { "value": "sichuan-leibo", "label": "乐山市", "children": [] },
    { "value": "sichuan-nanchong", "label": "南充市", "children": [] },
    { "value": "sichuan-meishan", "label": "眉山市", "children": [] },
    { "value": "sichuan-yibin", "label": "宜宾市", "children": [] },
    { "value": "sichuan-guangan", "label": "广安市", "children": [] },
    { "value": "sichuan-dazhou", "label": "达州市", "children": [] },
    { "value": "sichuan-yaan", "label": "雅安市", "children": [] },
    { "value": "sichuan-bazhong", "label": "巴中市", "children": [] },
    { "value": "sichuan-ziyang", "label": "资阳市", "children": [] },
    { "value": "sichuan-aba", "label": "阿坝藏族羌族自治州", "children": [] },
    { "value": "sichuan-ganzi", "label": "甘孜藏族自治州", "children": [] },
    { "value": "sichuan-liangshan", "label": "凉山彝族自治州", "children": [] }
  ],
  
  // 贵州省：补充主要城市
  guizhou: [
    { "value": "guizhou-guiyang", "label": "贵阳市", "children": [] },
    { "value": "guizhou-zunyi", "label": "遵义市", "children": [] },
    { "value": "guizhou-bijie", "label": "毕节市", "children": [] },
    { "value": "guizhou-liupanshui", "label": "六盘水市", "children": [] },
    { "value": "guizhou-qianxinan", "label": "黔西南布依族苗族自治州", "children": [] },
    { "value": "guizhou-anshun", "label": "安顺市", "children": [] },
    { "value": "guizhou-qiannan", "label": "黔南布依族苗族自治州", "children": [] },
    { "value": "guizhou-tongren", "label": "铜仁市", "children": [] },
    { "value": "guizhou-qianxi", "label": "黔东南苗族侗族自治州", "children": [] }
  ],
  
  // 云南省：补充主要城市
  yunnan: [
    { "value": "yunnan-kunming", "label": "昆明市", "children": [] },
    { "value": "yunnan-qujing", "label": "曲靖市", "children": [] },
    { "value": "yunnan-yingjiang", "label": "玉溪市", "children": [] },
    { "value": "yunnan-baoshan", "label": "保山市", "children": [] },
    { "value": "yunnan-zhaotong", "label": "昭通市", "children": [] },
    { "value": "yunnan-lijiang", "label": "丽江市", "children": [] },
    { "value": "yunnan-pu'er", "label": "普洱市", "children": [] },
    { "value": "yunnan-lincang", "label": "临沧市", "children": [] },
    { "value": "yunnan-chuxiong", "label": "楚雄彝族自治州", "children": [] },
    { "value": "yunnan-honghe", "label": "红河哈尼族彝族自治州", "children": [] },
    { "value": "yunnan-wenshan", "label": "文山壮族苗族自治州", "children": [] },
    { "value": "yunnan-wenshan", "label": "西双版纳傣族自治州", "children": [] },
    { "value": "yunnan-dali", "label": "大理白族自治州", "children": [] },
    { "value": "yunnan-dehong", "label": "德宏傣族景颇族自治州", "children": [] },
    { "value": "yunnan-nujiang", "label": "怒江傈僳族自治州", "children": [] },
    { "value": "yunnan-diqing", "label": "迪庆藏族自治州", "children": [] }
  ],
  
  // 西藏自治区：补充主要城市
  xizang: [
    { "value": "xizang-lasa", "label": "拉萨市", "children": [] },
    { "value": "xizang-shigatse", "label": "日喀则市", "children": [] },
    { "value": "xizang-changdu", "label": "昌都市", "children": [] },
    { "value": "xizang-naqu", "label": "那曲市", "children": [] },
    { "value": "xizang-ngari", "label": "阿里地区", "children": [] },
    { "value": "xizang-shannan", "label": "山南市", "children": [] },
    { "value": "xizang-linzhi", "label": "林芝市", "children": [] }
  ],
  
  // 陕西省：补充主要城市
  shaanxi: [
    { "value": "shaanxi-xian", "label": "西安市", "children": [] },
    { "value": "shaanxi-tongchuan", "label": "铜川市", "children": [] },
    { "value": "shaanxi-baoji", "label": "宝鸡市", "children": [] },
    { "value": "shaanxi-xianyang", "label": "咸阳市", "children": [] },
    { "value": "shaanxi-weinan", "label": "渭南市", "children": [] },
    { "value": "shaanxi-yanan", "label": "延安市", "children": [] },
    { "value": "shaanxi-hanzhong", "label": "汉中市", "children": [] },
    { "value": "shaanxi-ankang", "label": "安康市", "children": [] },
    { "value": "shaanxi-shangluo", "label": "商洛市", "children": [] },
    { "value": "shaanxi-yulin", "label": "榆林市", "children": [] }
  ],
  
  // 甘肃省：补充主要城市
  gansu: [
    { "value": "gansu-lanzhou", "label": "兰州市", "children": [] },
    { "value": "gansu-jiuquan", "label": "酒泉市", "children": [] },
    { "value": "gansu-zhangye", "label": "张掖市", "children": [] },
    { "value": "gansu-jinchang", "label": "金昌市", "children": [] },
    { "value": "gansu-wuwei", "label": "武威市", "children": [] },
    { "value": "gansu-baiyin", "label": "白银市", "children": [] },
    { "value": "gansu-qingyang", "label": "庆阳市", "children": [] },
    { "value": "gansu-pingliang", "label": "平凉市", "children": [] },
    { "value": "gansu-tianshui", "label": "天水市", "children": [] },
    { "value": "gansu-longnan", "label": "陇南市", "children": [] },
    { "value": "gansu-dingxi", "label": "定西市", "children": [] },
    { "value": "gansu-hezuo", "label": "临夏回族自治州", "children": [] },
    { "value": "gansu-gannan", "label": "甘南藏族自治州", "children": [] }
  ],
  
  // 青海省：补充主要城市
  qinghai: [
    { "value": "qinghai-xining", "label": "西宁市", "children": [] },
    { "value": "qinghai-hainan", "label": "海南藏族自治州", "children": [] },
    { "value": "qinghai-haibei", "label": "海北藏族自治州", "children": [] },
    { "value": "qinghai-huangnan", "label": "黄南藏族自治州", "children": [] },
    { "value": "qinghai-guoluo", "label": "果洛藏族自治州", "children": [] },
    { "value": "qinghai-yushu", "label": "玉树藏族自治州", "children": [] },
    { "value": "qinghai-haixi", "label": "海西蒙古族藏族自治州", "children": [] }
  ],
  
  // 宁夏回族自治区：补充主要城市
  ningxia: [
    { "value": "ningxia-yinchuan", "label": "银川市", "children": [] },
    { "value": "ningxia-shizuishan", "label": "石嘴山市", "children": [] },
    { "value": "ningxia-wuzhong", "label": "吴忠市", "children": [] },
    { "value": "ningxia-guangzhong", "label": "固原市", "children": [] },
    { "value": "ningxia-zhongwei", "label": "中卫市", "children": [] }
  ],
  
  // 新疆维吾尔自治区：补充主要城市
  xinjiang: [
    { "value": "xinjiang-urumqi", "label": "乌鲁木齐市", "children": [] },
    { "value": "xinjiang-kashgar", "label": "喀什地区", "children": [] },
    { "value": "xinjiang-shihezi", "label": "石河子市", "children": [] },
    { "value": "xinjiang-turpan", "label": "吐鲁番市", "children": [] },
    { "value": "xinjiang-hami", "label": "哈密市", "children": [] },
    { "value": "xinjiang-korla", "label": "巴音郭楞蒙古自治州", "children": [] },
    { "value": "xinjiang-kuytun", "label": "昌吉回族自治州", "children": [] },
    { "value": "xinjiang-aksu", "label": "阿克苏地区", "children": [] },
    { "value": "xinjiang-karamay", "label": "克拉玛依市", "children": [] },
    { "value": "xinjiang-kazak", "label": "伊犁哈萨克自治州", "children": [] },
    { "value": "xinjiang-tacheng", "label": "塔城地区", "children": [] },
    { "value": "xinjiang-altay", "label": "阿勒泰地区", "children": [] },
    { "value": "xinjiang-kizilsu", "label": "克孜勒苏柯尔克孜自治州", "children": [] },
    { "value": "xinjiang-hejing", "label": "博尔塔拉蒙古自治州", "children": [] },
    { "value": "xinjiang-heti", "label": "和田地区", "children": [] },
    { "value": "xinjiang-tumushuke", "label": "图木舒克市", "children": [] },
    { "value": "xinjiang-阿拉尔市", "label": "阿拉尔市", "children": [] },
    { "value": "xinjiang-kunyu", "label": "五家渠市", "children": [] },
    { "value": "xinjiang-shuanghe", "label": "双河市", "children": [] },
    { "value": "xinjiang-kuqa", "label": "铁门关市", "children": [] },
    { "value": "xinjiang-huyanghe", "label": "可克达拉市", "children": [] },
    { "value": "xinjiang-shawan", "label": "石河子市", "children": [] },
    { "value": "xinjiang-jiashi", "label": "昆玉市", "children": [] },
    { "value": "xinjiang-tuerhong", "label": "胡杨河市", "children": [] },
    { "value": "xinjiang-tiemenguan", "label": "新星市", "children": [] }
  ],
  
  // 香港特别行政区：无需补充
  hongkong: [],
  
  // 澳门特别行政区：无需补充
  macau: [],
  
  // 台湾省：补充主要城市
  taiwan: [
    { "value": "taiwan-taipei", "label": "台北市", "children": [] },
    { "value": "taiwan-taoyuan", "label": "桃园市", "children": [] },
    { "value": "taiwan-taichung", "label": "台中市", "children": [] },
    { "value": "taiwan-tainan", "label": "台南市", "children": [] },
    { "value": "taiwan-kaohsiung", "label": "高雄市", "children": [] },
    { "value": "taiwan-newtaipei", "label": "新北市", "children": [] },
    { "value": "taiwan-kinmen", "label": "金门县", "children": [] },
    { "value": "taiwan-penghu", "label": "澎湖县", "children": [] },
    { "value": "taiwan- lienchiang", "label": "连江县", "children": [] }
  ]
};

// 修复广东省数据中的value值问题
function fixGuangdongData(city) {
  if (city.children && city.children.length > 0) {
    city.children.forEach(district => {
      if (district.children && district.children.length > 0) {
        district.children.forEach(street => {
          if (street.value && street.value.startsWith('guangdong-undefined-undefined-')) {
            // 修复街道的value值
            const streetName = street.label;
            const cityValue = city.value;
            const districtValue = district.value;
            street.value = `${cityValue}-${districtValue}-${streetName}`;
          }
        });
      }
    });
  }
  return city;
}

// 补全省份城市数据的函数
function complementCityData() {
  // 读取现有地址数据
  const currentAddressDataPath = './addressData.ts';
  const dataContent = fs.readFileSync(currentAddressDataPath, 'utf8');
  
  // 提取数据部分
  const dataMatch = dataContent.match(/const completeAddressData = \[(.*?)\];/s);
  if (!dataMatch) {
    console.error('无法提取地址数据');
    return;
  }
  
  let addressData;
  try {
    addressData = JSON.parse(`[${dataMatch[1]}]`);
  } catch (error) {
    console.error('解析地址数据失败:', error);
    return;
  }
  
  // 创建备份文件
  const backupFileName = `addressData_backup_${Date.now()}_cities.ts`;
  fs.writeFileSync(`./${backupFileName}`, dataContent, 'utf8');
  console.log(`已创建备份文件: ${backupFileName}`);
  
  // 补全各省份的城市数据
  const updatedData = addressData.map(province => {
    const provinceKey = province.value;
    const provinceCities = provinceCityData[provinceKey];
    
    // 如果该省份有补充数据
    if (provinceCities && provinceCities.length > 0) {
      // 保存现有城市数据
      const existingCities = province.children || [];
      const existingCityValues = new Set(existingCities.map(city => city.value));
      
      // 添加新的城市数据（不重复）
      const newCities = provinceCities.filter(city => !existingCityValues.has(city.value));
      const updatedCities = [...existingCities, ...newCities];
      
      // 修复广东省数据
      if (provinceKey === 'guangdong') {
        updatedCities.forEach(city => fixGuangdongData(city));
      }
      
      return {
        ...province,
        children: updatedCities
      };
    }
    
    // 没有补充数据，返回原省份
    return province;
  });
  
  // 生成新的地址数据文件内容
  const newContent = `// 真实的中国地址数据
// 包含34个省级行政区、主要城市、区县和街道数据

const completeAddressData = ${JSON.stringify(updatedData, null, 2)};

export default completeAddressData;`;
  
  // 写入新文件
  fs.writeFileSync('./addressData.ts', newContent, 'utf8');
  console.log('地址数据补全完成！');
  console.log('已为各省份补充城市数据，保持现有正确数据不变。');
}

// 执行补全操作
complementCityData();