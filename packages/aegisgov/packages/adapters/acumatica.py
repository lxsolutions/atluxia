














"""
Dummy Acumatica adapter for development purposes.
In a production system, this would implement actual OData integration.
"""

class AcumaticaAdapter:
    def __init__(self):
        pass

    def authenticate(self, username: str, password: str) -> bool:
        """Dummy authentication method"""
        return username == "admin" and password == "devpassword"

    def get_kpi_data(self) -> dict:
        """Return mock KPI data"""
        return {
            "real_wage": 35.0,
            "unemployment": 4.8,
            "atkinson_index": 0.25,
            "carbon_intensity": 350,
            "reserve_margin": 18,
            "rent_burden": 28
        }

    def write_order(self, order_data: dict) -> bool:
        """Dummy method to simulate writing an order"""
        print(f"Writing order to Acumatica: {order_data}")
        return True










