import aiohttp
import asyncio
from typing import List, Optional
from .base import BaseConnector
from ..types import RawItem


class ShopifyConnector(BaseConnector):
    """Shopify Storefront API connector"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.store_url = config.get('store_url')
        self.access_token = config.get('access_token')
        self.api_version = config.get('api_version', '2023-07')

    def validate_config(self) -> bool:
        """Validate Shopify configuration"""
        if not self.store_url:
            raise ValueError("store_url is required for Shopify connector")
        
        if not self.access_token:
            raise ValueError("access_token is required for Shopify connector")
        
        # Clean store URL
        self.store_url = self.store_url.rstrip('/')
        
        return True

    async def fetch(self, **kwargs) -> List[RawItem]:
        """Fetch products from Shopify store"""
        self.validate_config()
        
        limit = kwargs.get('limit', 50)
        items = []
        
        async with aiohttp.ClientSession() as session:
            cursor = None
            
            while len(items) < limit:
                products_data = await self._fetch_products(session, cursor, limit)
                
                if not products_data:
                    break
                
                for product in products_data.get('products', {}).get('edges', []):
                    item = self._parse_product(product['node'])
                    if item:
                        items.append(item)
                
                # Check if there are more products
                page_info = products_data.get('products', {}).get('pageInfo', {})
                if page_info.get('hasNextPage'):
                    cursor = page_info.get('endCursor')
                else:
                    break
        
        return items[:limit]

    async def _fetch_products(self, session: aiohttp.ClientSession, cursor: Optional[str] = None, limit: int = 50):
        """Fetch products from Shopify GraphQL API"""
        query = """
        query($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                description
                vendor
                productType
                variants(first: 1) {
                  edges {
                    node {
                      price
                      compareAtPrice
                      sku
                    }
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      src
                      altText
                    }
                  }
                }
                onlineStoreUrl
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        """
        
        variables = {
            'first': min(limit, 50),
            'after': cursor
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': self.access_token
        }
        
        url = f"{self.store_url}/api/{self.api_version}/graphql.json"
        
        try:
            async with session.post(url, json={'query': query, 'variables': variables}, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('data', {})
                else:
                    print(f"Shopify API error: {response.status}")
                    return {}
        except Exception as e:
            print(f"Shopify connection error: {e}")
            return {}

    def _parse_product(self, product_data: dict) -> Optional[RawItem]:
        """Parse Shopify product data into RawItem"""
        try:
            # Get variant data
            variants = product_data.get('variants', {}).get('edges', [])
            variant = variants[0]['node'] if variants else {}
            
            # Get price
            price_str = variant.get('price') or '0'
            try:
                price = float(price_str)
            except (ValueError, TypeError):
                price = 0.0
            
            # Get images
            images = []
            for image_edge in product_data.get('images', {}).get('edges', []):
                image_node = image_edge.get('node', {})
                if image_node.get('src'):
                    images.append(image_node['src'])
            
            # Build specs
            specs = {}
            if product_data.get('productType'):
                specs['product_type'] = product_data['productType']
            if variant.get('sku'):
                specs['sku'] = variant['sku']
            if variant.get('compareAtPrice'):
                specs['compare_at_price'] = variant['compareAtPrice']
            
            return RawItem(
                source_id=product_data['id'],
                title=product_data['title'],
                description=product_data.get('description'),
                brand=product_data.get('vendor'),
                category=product_data.get('productType'),
                price=price,
                currency='USD',  # Shopify typically uses USD
                images=images,
                specs=specs,
                url=product_data.get('onlineStoreUrl'),
                metadata={
                    'source': 'shopify',
                    'store_url': self.store_url,
                    'variant_id': variant.get('id')
                }
            )
        except Exception as e:
            print(f"Error parsing Shopify product: {e}")
            return None