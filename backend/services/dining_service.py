from typing import Dict, List, Optional, Any
from datetime import date
from curl_cffi.requests import AsyncSession
from pydantic import BaseModel, Field, ConfigDict
from cachetools import TTLCache

period_cache: TTLCache = TTLCache(maxsize=20, ttl=86400)
menu_cache: TTLCache = TTLCache(maxsize = 15, ttl = 7200)

SUPPORTED_LOCATIONS: Dict[str, str] = {
    "stetson east": "586d05e4ee596f6e6c04b527",
    "international village": "5f4f8a425e42ad17329be131",
    "60 belvidere": "64ec985dc625af0a3b7ed795"
}

BASE_URL: str = "https://apiv4.dineoncampus.com/locations/"

async def fetch(url: str) -> Dict[str, Any]:
    async with AsyncSession(impersonate="chrome") as session:
        response = await session.get(url)
        response.raise_for_status()
        data = response.json()
        return data
    
async def get_periods(location_name: str) -> List[Dict[str, str]]:
    location_id = SUPPORTED_LOCATIONS[location_name]
    url = f"{BASE_URL}{location_id}/periods/?date={str(date.today())}"
    
    cache_key = f"periods-{location_id}-{str(date.today())}"
    if cache_key in period_cache:
        return period_cache[cache_key]

    data = await fetch(url)
    periods = data.get("periods", [])
    period_cache[cache_key] = periods
    return periods

async def get_period_id_by_name(location_name: str, period_name: str):
    periods = await get_periods(location_name)
    for period in periods:
        if period.get("name") == period_name:
            return period["id"]
    return None

#TODO: Add Vitamin fields later if needed

class Nutrients(BaseModel):
    model_config = ConfigDict(populate_by_name = True)

    calories: float | None = Field(None, alias="Calories")
    protein: float | None = Field(None, alias = "Protein (g)")
    carbohydrates: float | None = Field(None, alias = "Total Carbohydrates (g)")
    total_fat: float | None = Field(None, alias = "Total Fat (g)")
    saturated_fat: float | None = Field(None, alias = "Saturated Fat (g)")
    trans_fat: float | None = Field(None, alias = "Trans Fat (g)")
    dietary_fiber: float | None = Field(None, alias = "Dietary Fiber (g)")
    sugar: float | None = Field(None, alias = "Sugar (g)")
    sodium: float | None = Field(None, alias = "Sodium (mg)")
    cholesterol: float | None = Field(None, alias = "Cholesterol (mg)")
    potassium: float | None = Field(None, alias = "Potassium (mg)")
    calcium: float | None = Field(None, alias = "Calcium (mg)")
    iron: float | None = Field(None, alias = "Iron (mg)")
    calories_from_fat: float | None = Field(None, alias = "Calories From Fat")

class Item(BaseModel):
    name: str = "Unknown Item"
    description: str | None = Field(None, alias = "desc")
    portion: str | None = None
    ingredients: str | None = None
    calories: int | None = None
    dietary_preferences: list[str] = []
    allergens: list[str] = []
    custom_allergens: list[str] = Field(default_factory = list, alias = "customAllergens")
    nutrients: Nutrients

class Category(BaseModel):
    name: str = "Unknown Station"
    items: list[Item]

class Menu(BaseModel):
    categories: list[Category]

def parse_valuenumeric(value: str) -> float | None:
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def parse_nutrients(raw_nutrients: list[Dict[str, Any]]) -> Nutrients:
    nutrient_dict = {}
    for nutrient in raw_nutrients:
        name = nutrient.get("name")
        value = nutrient.get("valueNumeric")
        if name is not None and value is not None:
            nutrient_dict[name] = parse_valuenumeric(value)
    return Nutrients(**nutrient_dict)

def parse_item(raw_item: Dict[str, Any]) -> Item:
    dietary_preferences = []
    allergens = []
    
    for item_filter in raw_item.get("filters", []):
        if item_filter.get("icon") == True:
            dietary_preferences.append(item_filter["name"])
        elif item_filter.get("icon") == False:
            allergens.append(item_filter["name"])

    nutrients = parse_nutrients(raw_item.get("nutrients", []))
    raw_item["dietary_preferences"] = dietary_preferences
    raw_item["allergens"] = allergens
    raw_item["nutrients"] = nutrients
    return Item(**raw_item)

def parse_category(raw_category: dict[str, Any]) -> Category:
    name = raw_category.get("name")
    items_list = []
    category_dict = {}
    
    for item in raw_category.get("items", []):
        items_list.append(parse_item(item))

    category_dict["name"] = name
    category_dict["items"] = items_list
    return Category(**category_dict)

def parse_menu(raw_menu: dict[str, Any]) -> Menu:
    raw_categories = raw_menu.get("period", {}).get("categories", [])
    categories = [parse_category(category) for category in raw_categories]
    
    return Menu(
        categories = categories
    )

async def get_menu(location_name: str, period_name: str) -> Menu:
    location_id = SUPPORTED_LOCATIONS[location_name]
    cache_key = f"menu-{location_id}-{period_name}-{str(date.today())}"
    
    if cache_key in menu_cache:
        return menu_cache[cache_key]

    period_id = await get_period_id_by_name(location_name, period_name)
    url = f"{BASE_URL}{location_id}/menu?date={str(date.today())}&period={period_id}"
    response = await fetch(url)

    menu = parse_menu(response)
    menu_cache[cache_key] = menu
    return menu
