from typing import Dict, List, Any
from curl_cffi.requests.exceptions import HTTPError
from fastapi import APIRouter, HTTPException
from services.dining_service import SUPPORTED_LOCATIONS, get_menu, Menu, get_periods

router = APIRouter(prefix="/api/menu", tags=["menu"])

@router.get("/", response_model_by_alias=False)
async def menu_route(location_name: str, period_name: str) -> Menu:
    try:
        result = await get_menu(location_name = location_name, period_name = period_name)
        return result
    except KeyError:
        raise HTTPException(status_code = 404, detail = f"unsupported/unknown location: {location_name}")
    except HTTPError as e:
        raise HTTPException(status_code = e.response.status_code, detail = str(e))

@router.get("/locations")
async def locations_route() -> Dict[str, List[str]]:
    return {"supported_locations": list(SUPPORTED_LOCATIONS.keys())}

@router.get("/periods")
async def periods_route(location_name: str) -> List[Dict[str, str]]:
    try:
        result = await get_periods(location_name)
        return result
    except KeyError:
        raise HTTPException(status_code = 404, detail = f"unsupported/unknown location: {location_name}")
    except HTTPError as e:
        raise HTTPException(status_code = e.response.status_code, detail = str(e))