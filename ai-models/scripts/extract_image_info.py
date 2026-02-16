"""
从Label Studio JSON文件中提取图像信息
帮助找到图像文件的位置
"""

import json
import os
from pathlib import Path
from typing import List, Dict
import urllib.parse
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ImageExtractor:
    """图像信息提取器"""
    
    def __init__(self, json_files: List[str]):
        self.json_files = json_files
        self.image_info = []
        
    def extract_image_urls(self, json_file: str) -> List[Dict]:
        """从JSON文件中提取图像URL"""
        logger.info(f"处理文件: {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        image_urls = []
        
        for task in data:
            task_id = task.get('id', 0)
            data_field = task.get('data', {})
            image_url = data_field.get('image', '')
            
            if image_url:
                # 尝试解析URL
                parsed = urllib.parse.urlparse(image_url)
                
                # 提取文件名
                filename = os.path.basename(parsed.path)
                
                image_urls.append({
                    'task_id': task_id,
                    'url': image_url,
                    'filename': filename,
                    'path': parsed.path
                })
        
        logger.info(f"找到 {len(image_urls)} 个图像URL")
        return image_urls
    
    def analyze_image_paths(self):
        """分析图像路径模式"""
        logger.info("=" * 80)
        logger.info("分析图像路径模式")
        logger.info("=" * 80)
        
        all_image_info = []
        
        for json_file in self.json_files:
            image_urls = self.extract_image_urls(json_file)
            all_image_info.extend(image_urls)
        
        # 分析路径模式
        path_patterns = {}
        for info in all_image_info:
            path = info['path']
            # 获取目录路径
            dirname = os.path.dirname(path)
            if dirname not in path_patterns:
                path_patterns[dirname] = 0
            path_patterns[dirname] += 1
        
        logger.info(f"\n找到 {len(all_image_info)} 个图像URL")
        logger.info(f"\n路径模式统计:")
        for dirname, count in sorted(path_patterns.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  {dirname}: {count} 个图像")
        
        # 显示示例URL
        logger.info(f"\n示例图像URL:")
        for i, info in enumerate(all_image_info[:5]):
            logger.info(f"  {i+1}. Task ID: {info['task_id']}")
            logger.info(f"     URL: {info['url']}")
            logger.info(f"     文件名: {info['filename']}")
            logger.info(f"     路径: {info['path']}")
            logger.info("")
        
        # 保存图像信息到文件
        output_file = 'data/yolo_dataset/image_info.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_image_info, f, ensure_ascii=False, indent=2)
        
        logger.info(f"图像信息已保存到: {output_file}")
        
        return all_image_info, path_patterns
    
    def suggest_image_locations(self, path_patterns: Dict):
        """建议图像文件的可能位置"""
        logger.info("\n" + "=" * 80)
        logger.info("建议的图像文件位置")
        logger.info("=" * 80)
        
        suggestions = []
        
        # 基于路径模式建议
        for dirname, count in sorted(path_patterns.items(), key=lambda x: x[1], reverse=True):
            if '/upload/' in dirname:
                # Label Studio默认上传目录
                suggestions.append({
                    'type': 'Label Studio上传目录',
                    'path': dirname.replace('/upload/', ''),
                    'count': count
                })
            elif dirname.startswith('/'):
                suggestions.append({
                    'type': '绝对路径',
                    'path': dirname,
                    'count': count
                })
        
        # 常见位置建议
        common_locations = [
            '~/label-studio/data/upload',
            '~/label-studio/data/media',
            '~/Downloads',
            'data/images',
            'data/raw',
            'images',
        ]
        
        logger.info("\n基于路径模式的建议:")
        for i, suggestion in enumerate(suggestions[:5]):
            logger.info(f"{i+1}. {suggestion['type']}")
            logger.info(f"   路径: {suggestion['path']}")
            logger.info(f"   图像数量: {suggestion['count']}")
            logger.info("")
        
        logger.info("\n常见图像位置:")
        for i, location in enumerate(common_locations):
            logger.info(f"{i+1}. {location}")
        
        return suggestions


def main():
    """主函数"""
    # JSON文件路径
    json_files = [
        'c:\\Users\\hy\\Downloads\\project-1-at-2026-01-27-23-07-203d9713.json',
        'c:\\Users\\hy\\Downloads\\project-2-at-2026-01-27-23-11-1391a670.json',
        'c:\\Users\\hy\\Downloads\\project-3-at-2026-01-27-23-13-9bcb2cf0.json',
        'c:\\Users\\hy\\Downloads\\project-4-at-2026-01-27-23-13-9a41ec55.json',
        'c:\\Users\\hy\\Downloads\\project-5-at-2026-01-27-23-14-a467e942.json'
    ]
    
    # 创建提取器
    extractor = ImageExtractor(json_files)
    
    # 分析图像路径
    all_image_info, path_patterns = extractor.analyze_image_paths()
    
    # 建议图像位置
    suggestions = extractor.suggest_image_locations(path_patterns)
    
    print("\n" + "=" * 80)
    print("下一步操作:")
    print("=" * 80)
    print("1. 根据上述建议，找到图像文件的实际位置")
    print("2. 将图像文件复制到指定目录，或使用 --image-source-dir 参数指定图像目录")
    print("3. 运行数据准备脚本:")
    print("   python scripts/prepare_dataset.py --image-source-dir <图像目录>")
    print("\n如果图像在Label Studio服务器上，您需要:")
    print("1. 从Label Studio导出图像文件")
    print("2. 或使用Label Studio API下载图像")
    print("3. 或直接访问Label Studio的数据目录")


if __name__ == '__main__':
    main()
