import requests
import json
import time

print("=== 研究高德地图API获取街道数据 ===")

# 高德地图API密钥（需要申请）
AMAP_API_KEY = "YOUR_AMAP_API_KEY"

# 高德地图行政区划查询API
AMAP_DISTRICT_API = "https://restapi.amap.com/v3/config/district"

def get_district_info(keywords, subdistrict=1, extensions='base'):
    """
    获取行政区划信息
    :param keywords: 关键词（如：北京市）
    :param subdistrict: 显示下级行政区级数（1：返回下一级行政区，2：返回下两级行政区，3：返回下三级行政区）
    :param extensions: 返回结果控制（base：不返回下级行政区，all：返回下级行政区）
    :return: JSON格式的行政区划数据
    """
    params = {
        'key': AMAP_API_KEY,
        'keywords': keywords,
        'subdistrict': subdistrict,
        'extensions': extensions,
        'output': 'JSON'
    }
    
    try:
        response = requests.get(AMAP_DISTRICT_API, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"请求失败: {e}")
        return None

def get_street_data(province_name, city_name, district_name):
    """
    获取指定区县的街道数据
    :param province_name: 省份名称
    :param city_name: 城市名称
    :param district_name: 区县名称
    :return: 街道数据列表
    """
    # 使用高德地图API获取街道数据
    # 注意：高德地图API可能需要多次调用才能获取完整的街道数据
    
    # 方法1：通过行政区划查询获取下级区划
    district_info = get_district_info(district_name, subdistrict=1, extensions='all')
    
    if district_info and district_info.get('status') == '1':
        districts = district_info.get('districts', [])
        if districts:
            # 获取第一个匹配的区县
            district_data = districts[0]
            # 获取下级区划（街道）
            streets = district_data.get('districts', [])
            
            street_list = []
            for street in streets:
                street_list.append({
                    'name': street.get('name', ''),
                    'adcode': street.get('adcode', ''),
                    'level': street.get('level', '')
                })
            
            return street_list
    
    return []

def test_amap_api():
    """测试高德地图API"""
    print("\n=== 测试高德地图API ===")
    
    # 测试获取北京市的行政区划
    print("\n1. 测试获取北京市的行政区划:")
    beijing_data = get_district_info('北京市', subdistrict=1, extensions='base')
    
    if beijing_data:
        print(f"   状态: {beijing_data.get('status')}")
        print(f"   信息: {beijing_data.get('info')}")
        
        if beijing_data.get('status') == '1':
            districts = beijing_data.get('districts', [])
            if districts:
                print(f"   找到 {len(districts)} 个区划")
                for district in districts[:3]:  # 只显示前3个
                    print(f"   - {district.get('name')} (adcode: {district.get('adcode')})")
    
    # 测试获取顺义区的街道数据
    print("\n2. 测试获取顺义区的街道数据:")
    shunyi_streets = get_street_data('北京市', '北京市', '顺义区')
    
    if shunyi_streets:
        print(f"   找到 {len(shunyi_streets)} 个街道:")
        for street in shunyi_streets[:5]:  # 只显示前5个
            print(f"   - {street['name']} (adcode: {street['adcode']}, level: {street['level']})")
    else:
        print("   未找到街道数据")

def analyze_api_usage():
    """分析API使用情况"""
    print("\n=== 高德地图API使用分析 ===")
    
    print("\n1. API限制:")
    print("   - 个人开发者：每日5000次免费调用")
    print("   - 企业开发者：每日100万次调用")
    print("   - 需要申请API密钥")
    
    print("\n2. 数据获取策略:")
    print("   - 优先获取人口密集、经济发达地区的街道数据")
    print("   - 分批获取，避免超过API限制")
    print("   - 缓存已获取的数据，避免重复请求")
    
    print("\n3. 数据获取顺序建议:")
    print("   - 第一批：北京市、上海市、广州市、深圳市（直辖市和一线城市）")
    print("   - 第二批：其他省会城市和计划单列市")
    print("   - 第三批：其他地级市")
    print("   - 第四批：县级市和县")

def create_street_fetch_plan():
    """创建街道数据获取计划"""
    print("\n=== 街道数据获取计划 ===")
    
    # 定义优先级地区
    priority_areas = {
        'high': [
            ('北京市', '北京市', ['东城区', '西城区', '朝阳区', '海淀区', '丰台区']),
            ('上海市', '上海市', ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区']),
            ('广东省', '广州市', ['越秀区', '海珠区', '荔湾区', '天河区', '白云区']),
            ('广东省', '深圳市', ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区'])
        ],
        'medium': [
            ('天津市', '天津市', ['和平区', '河东区', '河西区', '南开区', '河北区']),
            ('重庆市', '重庆市', ['渝中区', '江北区', '南岸区', '九龙坡区', '沙坪坝区']),
            ('浙江省', '杭州市', ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区']),
            ('江苏省', '南京市', ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区'])
        ],
        'low': [
            # 其他地级市
        ]
    }
    
    print("\n1. 高优先级地区（人口密集、经济发达）:")
    for province, city, districts in priority_areas['high']:
        print(f"   {province} - {city}:")
        for district in districts:
            print(f"     - {district}")
    
    print("\n2. 中优先级地区:")
    for province, city, districts in priority_areas['medium']:
        print(f"   {province} - {city}:")
        for district in districts:
            print(f"     - {district}")
    
    print("\n3. 低优先级地区:")
    print("   其他地级市、县级市和县")

def create_update_mechanism():
    """创建街道数据定期更新机制"""
    print("\n=== 街道数据定期更新机制 ===")
    
    print("\n1. 更新频率:")
    print("   - 每月检查一次行政区划变更")
    print("   - 每季度更新一次街道数据")
    print("   - 每年进行一次全面数据审核")
    
    print("\n2. 更新流程:")
    print("   a. 从民政部官网获取最新行政区划数据")
    print("   b. 对比现有数据，识别变更")
    print("   c. 使用API获取新增或变更的街道数据")
    print("   d. 更新数据文件")
    print("   e. 进行数据验证")
    print("   f. 备份旧数据")
    
    print("\n3. 数据验证:")
    print("   - 检查街道名称是否重复")
    print("   - 检查街道value是否与区县匹配")
    print("   - 检查街道是否属于正确的城市")
    print("   - 检查数据格式是否正确")
    
    print("\n4. 备份机制:")
    print("   - 每次更新前备份当前数据")
    print("   - 保留最近3个月的备份")
    print("   - 使用版本控制系统（Git）管理数据变更")

if __name__ == "__main__":
    # 分析API使用情况
    analyze_api_usage()
    
    # 创建街道数据获取计划
    create_street_fetch_plan()
    
    # 创建街道数据定期更新机制
    create_update_mechanism()
    
    # 测试高德地图API（需要有效的API密钥）
    print("\n注意：要测试高德地图API，需要先申请API密钥并替换脚本中的AMAP_API_KEY")
    print("申请地址：https://console.amap.com/dev/key/app")
    
    # 如果有有效的API密钥，可以取消下面的注释进行测试
    # test_amap_api()