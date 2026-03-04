import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "../constants/theme";

interface LiveMapProps {
  /** Height of the map container */
  height?: number;
  /** Whether to continuously track location */
  tracking?: boolean;
}

/**
 * Live map component using OpenStreetMap + Leaflet.
 * Renders in a WebView — no API key required.
 * Requests location permission and tracks the device position.
 */
export default function LiveMap({
  height = 256,
  tracking = true,
}: LiveMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Request permission & start watching location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied");
        return;
      }

      // Get initial location quickly
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(initial);

      // Continuous tracking
      if (tracking) {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (loc) => {
            setLocation(loc);
          },
        );
      }
    })();

    return () => {
      subscription?.remove();
    };
  }, [tracking]);

  // Push location updates to the WebView map
  useEffect(() => {
    if (location && mapReady && webViewRef.current) {
      const { latitude, longitude } = location.coords;
      webViewRef.current.injectJavaScript(`
        updatePosition(${latitude}, ${longitude});
        true;
      `);
    }
  }, [location, mapReady]);

  if (errorMsg) {
    return (
      <View
        style={{ height }}
        className="bg-gray-100 items-center justify-center"
      >
        <Text className="text-red-500 text-xs font-medium">{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View
        style={{ height }}
        className="bg-gray-100 items-center justify-center"
      >
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text className="text-gray-400 text-xs mt-2">
          Acquiring GPS signal...
        </Text>
      </View>
    );
  }

  const { latitude, longitude } = location.coords;

  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .pulse-marker {
      width: 20px; height: 20px;
      border-radius: 50%;
      background: ${Colors.primary};
      border: 3px solid white;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
      70% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${latitude}, ${longitude}], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OSM'
    }).addTo(map);

    var markerIcon = L.divIcon({
      className: '',
      html: '<div class="pulse-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    var marker = L.marker([${latitude}, ${longitude}], { icon: markerIcon }).addTo(map);

    var trail = L.polyline([], {
      color: '${Colors.primary}',
      weight: 3,
      opacity: 0.7
    }).addTo(map);

    function updatePosition(lat, lng) {
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng], { animate: true, duration: 1 });
      trail.addLatLng([lat, lng]);
    }

    // Signal map is ready
    window.ReactNativeWebView.postMessage('MAP_READY');
  </script>
</body>
</html>
  `;

  return (
    <View style={{ height, overflow: "hidden" }} className="relative">
      <WebView
        ref={webViewRef}
        source={{ html: leafletHTML }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          if (event.nativeEvent.data === "MAP_READY") {
            setMapReady(true);
          }
        }}
      />

      {/* LIVE badge overlay */}
      <View className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
        <Text className="text-xs font-bold text-gray-700">LIVE</Text>
      </View>
    </View>
  );
}
