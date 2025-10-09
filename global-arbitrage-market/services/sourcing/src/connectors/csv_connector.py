import csv
import asyncio
from typing import List
from pathlib import Path
from .base import BaseConnector
from ..types import RawItem


class CSVConnector(BaseConnector):
    """CSV file connector for supplier data"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.file_path = config.get('file_path')
        self.supplier_id = config.get('supplier_id', 'csv_supplier')

    def validate_config(self) -> bool:
        """Validate CSV configuration"""
        if not self.file_path:
            raise ValueError("file_path is required for CSV connector")
        
        if not Path(self.file_path).exists():
            raise FileNotFoundError(f"CSV file not found: {self.file_path}")
        
        return True

    async def fetch(self, **kwargs) -> List[RawItem]:
        """Fetch items from CSV file"""
        self.validate_config()
        
        items = []
        
        # Run CSV reading in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._read_csv, items)
        
        return items

    def _read_csv(self, items: List[RawItem]):
        """Read CSV file synchronously"""
        with open(self.file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    item = self._parse_row(row, row_num)
                    if item:
                        items.append(item)
                except Exception as e:
                    print(f"Error parsing row {row_num}: {e}")

    def _parse_row(self, row: dict, row_num: int) -> RawItem:
        """Parse a CSV row into RawItem"""
        # Map CSV columns to RawItem fields
        source_id = row.get('id') or row.get('sku') or f"csv_{self.supplier_id}_{row_num}"
        title = row.get('title') or row.get('name') or ""
        
        if not title:
            raise ValueError("Title is required")
        
        # Parse price
        price_str = row.get('price') or row.get('base_price') or "0"
        try:
            price = float(price_str)
        except (ValueError, TypeError):
            price = 0.0
        
        # Parse images
        images_str = row.get('images') or row.get('image_url') or ""
        images = [img.strip() for img in images_str.split(',')] if images_str else []
        
        # Build specs from remaining columns
        specs = {}
        for key, value in row.items():
            if key not in ['id', 'sku', 'title', 'name', 'price', 'base_price', 'images', 'image_url', 'brand', 'category']:
                if value and value.strip():
                    specs[key] = value
        
        return RawItem(
            source_id=source_id,
            title=title,
            description=row.get('description'),
            brand=row.get('brand'),
            category=row.get('category'),
            price=price,
            currency=row.get('currency', 'USD'),
            images=images,
            specs=specs,
            metadata={
                'supplier_id': self.supplier_id,
                'row_number': row_num,
                'source': 'csv'
            }
        )