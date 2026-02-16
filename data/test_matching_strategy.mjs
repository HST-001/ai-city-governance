import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在ES模块中定义__dirname和__filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入数据补全模块
import('./complete_district_data.mjs').then(module => {
  // 提取需要测试的函数
  const { 
    officialDistrictData, 
    cityNameMappings, 
    getCityBaseValue, 
    findMatchingCityKey, 
    levenshteinDistance, 
    completeDistrictsForCity, 
    completeDistricts 
  } = module;

  // 测试结果记录
  const testResults = [];

  // 测试1: getCityBaseValue函数
  function testCityBaseValue() {
    console.log('\n=== 测试1: getCityBaseValue函数 ===');
    
    const testCases = [
      { input: 'beijing', expected: 'beijing' },
      { input: 'hebei-shijiazhuang', expected: 'shijiazhuang' },
      { input: 'guangdong-guangzhou', expected: 'guangzhou' },
      { input: 'jiangsu-nanjing', expected: 'nanjing' }
    ];

    testCases.forEach(({ input, expected }, index) => {
      const result = getCityBaseValue(input);
      const passed = result === expected;
      
      console.log(`测试${index + 1}: ${input} -> ${result} ${passed ? '✓' : '✗'} (预期: ${expected})`);
      testResults.push({ test: `getCityBaseValue-${index + 1}`, passed, input, expected, result });
    });
  }

  // 测试2: Levenshtein距离计算
  function testLevenshteinDistance() {
    console.log('\n=== 测试2: Levenshtein距离计算 ===');
    
    const testCases = [
      { a: 'beijing', b: 'beijing', expected: 0 },
      { a: 'shanghai', b: 'shangha', expected: 1 },
      { a: 'guangzhou', b: 'guagnzhou', expected: 1 },
      { a: 'wuhan', b: 'wuhai', expected: 1 },
      { a: 'chengdu', b: 'chengd', expected: 1 },
      { a: 'xian', b: 'xianyang', expected: 3 }
    ];

    testCases.forEach(({ a, b, expected }, index) => {
      const result = levenshteinDistance(a, b);
      const passed = result === expected;
      
      console.log(`测试${index + 1}: ${a} 与 ${b} 之间的距离: ${result} ${passed ? '✓' : '✗'} (预期: ${expected})`);
      testResults.push({ test: `levenshteinDistance-${index + 1}`, passed, input: `${a}, ${b}`, expected, result });
    });
  }

  // 测试3: findMatchingCityKey函数
  function testFindMatchingCityKey() {
    console.log('\n=== 测试3: findMatchingCityKey函数 ===');
    
    const testCases = [
      // 直接匹配
      { cityValue: 'beijing', provinceValue: 'beijing', expected: 'beijing' },
      { cityValue: 'shanghai', provinceValue: 'shanghai', expected: 'shanghai' },
      
      // 带省份前缀的匹配
      { cityValue: 'hebei-shijiazhuang', provinceValue: 'hebei', expected: 'shijiazhuang' },
      { cityValue: 'guangdong-guangzhou', provinceValue: 'guangdong', expected: 'guangzhou' },
      
      // 别名匹配
      { cityValue: '北京', provinceValue: 'beijing', expected: 'beijing' },
      { cityValue: '广州市', provinceValue: 'guangdong', expected: 'guangzhou' },
      
      // 特殊别名匹配
      { cityValue: '羊城', provinceValue: 'guangdong', expected: 'guangzhou' },
      { cityValue: '蓉城', provinceValue: 'sichuan', expected: 'chengdu' },
      
      // 模糊匹配（轻微拼写错误）
      { cityValue: 'beijng', provinceValue: 'beijing', expected: 'beijing' },
      { cityValue: 'shangha', provinceValue: 'shanghai', expected: 'shanghai' },
      
      // 无匹配情况
      { cityValue: 'nonexistent-city', provinceValue: 'test', expected: null }
    ];

    testCases.forEach(({ cityValue, provinceValue, expected }, index) => {
      const result = findMatchingCityKey(cityValue, provinceValue);
      const passed = result === expected;
      
      console.log(`测试${index + 1}: city=${cityValue}, province=${provinceValue} -> ${result} ${passed ? '✓' : '✗'} (预期: ${expected})`);
      testResults.push({ test: `findMatchingCityKey-${index + 1}`, passed, input: `${cityValue}, ${provinceValue}`, expected, result });
    });
  }

  // 测试4: completeDistrictsForCity函数
  function testCompleteDistrictsForCity() {
    console.log('\n=== 测试4: completeDistrictsForCity函数 ===');
    
    // 测试用的城市数据
    const cityData = {
      value: 'beijing',
      label: '北京',
      children: [
        { value: 'beijing-dongcheng', label: '东城区', children: [] },
        { value: 'beijing-xicheng', label: '西城区', children: [] }
      ]
    };

    const result = completeDistrictsForCity(cityData, 'beijing');
    
    // 检查结果
    const hasAllDistricts = result.children && result.children.length === officialDistrictData['beijing'].length;
    const passed = hasAllDistricts;
    
    console.log(`测试1: 补全北京区县数据 -> ${result.children.length}个区县 ${passed ? '✓' : '✗'} (预期: ${officialDistrictData['beijing'].length}个)`);
    console.log('  补全的区县:', result.children.map(d => d.label).join(', '));
    
    testResults.push({ 
      test: 'completeDistrictsForCity-1', 
      passed, 
      input: 'beijing', 
      expected: officialDistrictData['beijing'].length, 
      result: result.children.length 
    });
  }

  // 测试5: 整体数据补全功能
  function testCompleteDistricts() {
    console.log('\n=== 测试5: completeDistricts函数 ===');
    
    // 测试用的地址数据
    const testAddressData = [
      {
        value: 'beijing',
        label: '北京',
        children: [
          {
            value: 'beijing',
            label: '北京市',
            children: [] // 空的区县列表
          }
        ]
      },
      {
        value: 'guangdong',
        label: '广东',
        children: [
          {
            value: 'guangdong-guangzhou',
            label: '广州市',
            children: [
              { value: 'guangzhou-yuexiu', label: '越秀区', children: [] } // 只有一个区县
            ]
          }
        ]
      }
    ];

    const result = completeDistricts(testAddressData);
    
    // 检查结果
    const beijingCity = result[0].children[0];
    const guangzhouCity = result[1].children[0];
    
    const beijingPassed = beijingCity.children.length === officialDistrictData['beijing'].length;
    const guangzhouPassed = guangzhouCity.children.length === officialDistrictData['guangzhou'].length;
    
    console.log(`测试1: 北京数据补全 -> ${beijingCity.children.length}个区县 ${beijingPassed ? '✓' : '✗'} (预期: ${officialDistrictData['beijing'].length}个)`);
    console.log(`测试2: 广州数据补全 -> ${guangzhouCity.children.length}个区县 ${guangzhouPassed ? '✓' : '✗'} (预期: ${officialDistrictData['guangzhou'].length}个)`);
    
    testResults.push({ test: 'completeDistricts-beijing', passed: beijingPassed });
    testResults.push({ test: 'completeDistricts-guangzhou', passed: guangzhouPassed });
  }

  // 运行所有测试
  function runAllTests() {
    console.log('开始测试数据匹配策略...');
    
    testCityBaseValue();
    testLevenshteinDistance();
    testFindMatchingCityKey();
    testCompleteDistrictsForCity();
    testCompleteDistricts();
    
    // 汇总测试结果
    console.log('\n=== 测试结果汇总 ===');
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    
    console.log(`测试总数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    // 显示失败的测试
    const failedTests = testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n失败的测试详情:');
      failedTests.forEach(test => {
        console.log(`  ${test.test}: 输入=${test.input}, 预期=${test.expected}, 实际=${test.result}`);
      });
    } else {
      console.log('\n🎉 所有测试通过！');
    }
    
    // 保存测试结果到文件
    const testReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests: failedTests.length,
      passRate: (passedTests / totalTests) * 100,
      testCases: testResults
    };
    
    const reportPath = path.join(__dirname, 'test_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2), 'utf8');
    console.log(`\n测试报告已保存到: ${reportPath}`);
  }

  // 执行测试
  runAllTests();
}).catch(error => {
  console.error('导入模块失败:', error);
});