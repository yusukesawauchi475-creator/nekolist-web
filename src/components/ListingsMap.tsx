import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Listing } from "../types";

// Leafletのデフォルトアイコンを修正（SSR対応）
if (typeof window !== "undefined") {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// エリアごとの座標データ
const AREA_COORDINATES: Record<string, Record<string, [number, number]>> = {
  nyc: {
    "Manhattan": [40.7831, -73.9712],
    "Brooklyn": [40.6782, -73.9442],
    "Queens": [40.7282, -73.7949],
    "Bronx": [40.8448, -73.8648],
    "Staten Island": [40.5795, -74.1502],
    "全域": [40.7128, -74.0060], // NYC中心
  },
  la: {
    "Downtown": [34.0522, -118.2437],
    "West LA": [34.0522, -118.4426],
    "South Bay": [33.8651, -118.3808],
    "East LA": [34.0239, -118.1728],
    "San Fernando Valley": [34.1867, -118.4495],
    "全域": [34.0522, -118.2437], // LA中心
  },
  ldn: {
    "Central": [51.5074, -0.1278],
    "East": [51.5155, -0.0588],
    "West": [51.5074, -0.1957],
    "North": [51.5450, -0.1278],
    "South": [51.4620, -0.1278],
    "全域": [51.5074, -0.1278], // London中心
  },
  vancouver: {
    "Downtown": [49.2827, -123.1207],
    "West End": [49.2833, -123.1344],
    "Kitsilano": [49.2747, -123.1556],
    "East Vancouver": [49.2606, -123.0694],
    "North Vancouver": [49.3200, -123.0722],
    "Richmond": [49.1666, -123.1364],
    "Burnaby": [49.2488, -123.1089],
    "全域": [49.2827, -123.1207], // Vancouver中心
  },
};

// 都市ごとのデフォルト中心座標とズームレベル
const CITY_CENTER: Record<string, { center: [number, number]; zoom: number }> = {
  nyc: { center: [40.7128, -74.0060], zoom: 11 },
  la: { center: [34.0522, -118.2437], zoom: 11 },
  ldn: { center: [51.5074, -0.1278], zoom: 11 },
  vancouver: { center: [49.2827, -123.1207], zoom: 11 },
};

interface ListingsMapProps {
  listings: Listing[];
  city: string;
  onListingClick: (listingId: string) => void;
}

// マップのビューを更新するコンポーネント
function MapViewUpdater({ city }: { city: string }) {
  const map = useMap();
  
  useEffect(() => {
    const config = CITY_CENTER[city];
    if (config) {
      map.setView(config.center, config.zoom);
    }
  }, [city, map]);

  return null;
}

export default function ListingsMap({ listings, city, onListingClick }: ListingsMapProps) {
  // エリアごとに投稿をグループ化し、座標を取得
  // 地図は単に表示するだけ。投稿データには影響しない
  const markers = useMemo(() => {
    const cityAreas = AREA_COORDINATES[city] || {};
    const areaGroups = new Map<string, Listing[]>();

    // エリアごとに投稿をグループ化（地図表示用のみ）
    listings.forEach((listing) => {
      if (listing.status !== "sold") { // soldでない投稿のみ地図に表示
        const area = listing.area;
        if (!areaGroups.has(area)) {
          areaGroups.set(area, []);
        }
        areaGroups.get(area)!.push(listing);
      }
    });

    // マーカーを作成
    const result: Array<{
      position: [number, number];
      listings: Listing[];
      area: string;
    }> = [];

    areaGroups.forEach((listings, area) => {
      const coordinates = cityAreas[area];
      if (coordinates && listings.length > 0) {
        result.push({
          position: coordinates,
          listings,
          area,
        });
      }
    });

    return result;
  }, [listings, city]);

  const cityConfig = CITY_CENTER[city] || CITY_CENTER.nyc;

  if (typeof window === "undefined") {
    return <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">地図を読み込み中...</div>;
  }

  // バンクーバーをデフォルトに設定（cityがvancouverでない場合も）
  const defaultCenter = cityConfig.center;
  const defaultZoom = cityConfig.zoom;

  return (
    <div style={{ height: '300px', width: '100%', position: 'relative', zIndex: 1 }} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        {...({ center: defaultCenter, zoom: defaultZoom, scrollWheelZoom: true } as any)}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <MapViewUpdater city={city} />
        <TileLayer
          {...({ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any)}
        />
        {markers.map((markerGroup, index) => (
          <Marker
            key={`${markerGroup.area}-${index}`}
            {...({ position: markerGroup.position, icon: new Icon({
                iconUrl: markerGroup.listings.length > 1
                  ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
                  : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              }) } as any)}
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <div className="font-semibold text-sm mb-2">{markerGroup.area}</div>
                <div className="text-xs text-gray-600 mb-2">
                  {markerGroup.listings.length}件の投稿
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {markerGroup.listings.slice(0, 5).map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => onListingClick(listing.id)}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-xs truncate">{listing.title}</div>
                      {listing.price && (
                        <div className="text-xs text-blue-600 font-semibold">{listing.price}</div>
                      )}
                    </div>
                  ))}
                  {markerGroup.listings.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      +{markerGroup.listings.length - 5}件
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
