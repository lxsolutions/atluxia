from abc import ABC, abstractmethod
from typing import List, Optional
from ..types import RawItem


class BaseConnector(ABC):
    """Base connector interface for all data sources"""

    def __init__(self, config: dict):
        self.config = config
        self.name = self.__class__.__name__

    @abstractmethod
    async def fetch(self, **kwargs) -> List[RawItem]:
        """Fetch raw items from the source"""
        pass

    @abstractmethod
    def validate_config(self) -> bool:
        """Validate connector configuration"""
        pass

    def get_name(self) -> str:
        """Get connector name"""
        return self.name

    async def health_check(self) -> bool:
        """Check if connector is healthy"""
        try:
            # Try a minimal fetch to test connectivity
            test_items = await self.fetch(limit=1)
            return len(test_items) >= 0  # Success if no exception
        except Exception:
            return False