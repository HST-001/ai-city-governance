import json

def load_data():
    with open(r'c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\frontend\src\data\addressData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        data_str = content.split('const completeAddressData = ')[1].split('export default completeAddressData')[0].strip()
        if data_str.endswith(';'):
            data_str = data_str[:-1].strip()
        data = json.loads(data_str)
    return data

def save_data(data):
    with open(r'c:\Users\hy\Desktop\AI Coding Learning\AI+城市治理\frontend\src\data\addressData.ts', 'w', encoding='utf-8') as f:
        f.write('const completeAddressData = ')
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(';\nexport default completeAddressData')

def add_default_options(data):
    print("=" * 80)
    print("为缺少街道数据的区县添加默认选项")
    print("=" * 80)
    
    updated_count = 0
    
    for province in data:
        province_name = province['label']
        
        for city in province['children']:
            city_name = city['label']
            
            for district in city['children']:
                district_name = district['label']
                district_value = district['value']
                streets = district.get('children', [])
                
                if len(streets) == 0:
                    default_streets = [
                        {
                            "value": f"{district_value}-待定",
                            "label": "待定",
                            "children": []
                        },
                        {
                            "value": f"{district_value}-手动填写",
                            "label": "手动填写",
                            "children": []
                        }
                    ]
                    district['children'] = default_streets
                    updated_count += 1
    
    print(f"\n已为 {updated_count} 个区县添加默认选项")
    print("  - 待定")
    print("  - 手动填写")
    
    print("\n" + "=" * 80)
    print("默认选项添加完成！")
    print("=" * 80)
    
    return updated_count

def main():
    data = load_data()
    updated_count = add_default_options(data)
    
    if updated_count > 0:
        save_data(data)
        print("\n数据已保存到 addressData.ts")
    else:
        print("\n未发现需要添加默认选项的区县")

if __name__ == '__main__':
    main()
