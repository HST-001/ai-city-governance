// 简化的中国地址数据（从备份恢复）
// 包含基本的省级行政区信息

const completeAddressData = [
  // 北京市
  { value: '北京市', label: '北京市',
      children: [
      { value: '东城区', label: '东城区' },
      { value: '西城区', label: '西城区' },
      { value: '朝阳区', label: '朝阳区' },
      { value: '丰台区', label: '丰台区' },
      { value: '石景山区', label: '石景山区' },
      { value: '海淀区', label: '海淀区' }
    ]
  },
  // 天津市
  { value: '天津市', label: '天津市',
      children: [
      { value: '和平区', label: '和平区' },
      { value: '河东区', label: '河东区' },
      { value: '河西区', label: '河西区' },
      { value: '南开区', label: '南开区' }
    ]
  },
  // 河北省
  { value: '河北省', label: '河北省',
      children: [
      { value: '石家庄市', label: '石家庄市' },
      { value: '唐山市', label: '唐山市' },
      { value: '秦皇岛市', label: '秦皇岛市' }
    ]
  },
  // 山西省
  { value: '山西省', label: '山西省',
      children: [
      { value: '太原市', label: '太原市' },
      { value: '大同市', label: '大同市' },
      { value: '阳泉市', label: '阳泉市' }
    ]
  },
  // 内蒙古自治区
  { value: '内蒙古自治区', label: '内蒙古自治区',
      children: [
      { value: '呼和浩特市', label: '呼和浩特市' },
      { value: '包头市', label: '包头市' },
      { value: '乌海市', label: '乌海市' }
    ]
  }
];

export default completeAddressData;