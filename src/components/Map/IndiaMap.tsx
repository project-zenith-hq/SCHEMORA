"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import styles from "./IndiaMap.module.css";
import { useTranslation } from "@/context/TranslationContext";

// TopoJSON from a reliable source (simplified India map)
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/india-topojson.json";

// Mock data indicating nodal presence / active schemes by state
const mockData = [
  { id: "MH", state: "Maharashtra", value: 120, active: true },
  { id: "GJ", state: "Gujarat", value: 85, active: true },
  { id: "KA", state: "Karnataka", value: 95, active: true },
  { id: "TN", state: "Tamil Nadu", value: 110, active: true },
  { id: "DL", state: "Delhi", value: 60, active: true },
  { id: "UP", state: "Uttar Pradesh", value: 45, active: true },
  { id: "WB", state: "West Bengal", value: 70, active: true },
  { id: "TS", state: "Telangana", value: 80, active: true },
  { id: "HR", state: "Haryana", value: 55, active: true },
  { id: "MP", state: "Madhya Pradesh", value: 40, active: true },
  { id: "RJ", state: "Rajasthan", value: 50, active: true },
];

const geoUrl = "/india-states.json";

// Mock data representing pan-India scheme availability & channel partners
const stateData: Record<string, { schemes: number; partners: number; coords?: [number, number] }> = {
  "Maharashtra": { schemes: 6, partners: 142, coords: [76.0, 19.5] },
  "Gujarat": { schemes: 6, partners: 98, coords: [71.5, 22.5] },
  "Karnataka": { schemes: 6, partners: 115, coords: [76.0, 14.5] },
  "Uttar Pradesh": { schemes: 5, partners: 201, coords: [80.5, 27.0] },
  "Delhi": { schemes: 6, partners: 85, coords: [77.1, 28.6] },
  "Tamil Nadu": { schemes: 6, partners: 134, coords: [78.5, 11.0] },
  "Telangana": { schemes: 5, partners: 76, coords: [79.0, 17.5] },
};

export default function IndiaMap() {
  const [tooltip, setTooltip] = useState<{
    content: { name: string; schemes: number; partners: number } | null;
    x: number;
    y: number;
  }>({ content: null, x: 0, y: 0 });

  const [isMounted, setIsMounted] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  // Viewport State
  const [position, setPosition] = useState({ coordinates: [80, 22] as [number, number], zoom: 1 });
  const [activeStateDetails, setActiveStateDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch on lazy load

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [80, 22], zoom: 1 });
    setActiveStateDetails(null);
  };

  const handleStateClick = (stateName: string, geo: any) => {
    const data = stateData[stateName];
    if (data?.coords) {
      setPosition({ coordinates: data.coords, zoom: 3 });
      setActiveStateDetails(stateName);
    } else {
      setActiveStateDetails(stateName);
    }
  };

  const handleSearchSelect = (stateName: string) => {
    const data = stateData[stateName];
    if (data?.coords) {
      setPosition({ coordinates: data.coords, zoom: 3 });
      setActiveStateDetails(stateName);
    }
    setSearchQuery("");
    setIsSearching(false);
  };

  const activeHubs = Object.keys(stateData);
  const searchResults = searchQuery.trim() 
    ? activeHubs.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className={styles.mapContainer}>
      
      {/* Overlay Search Bar */}
      <div className={styles.searchOverlay}>
        <div className={styles.searchInputWrapper}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder={t('map.searchPlaceholder')}
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(true);
            }}
            onFocus={() => setIsSearching(true)}
          />
        </div>
        {isSearching && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((s) => (
              <div key={s} className={styles.searchResultItem} onClick={() => handleSearchSelect(s)}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className={styles.mapWrapper}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [80, 22] // Center of India
          }}
          width={800}
          height={600}
        >
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates} 
            onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates as [number, number], zoom: pos.zoom || 1 })}
            translateExtent={[[0, 0], [800, 600]]}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties?.name || "";
                  const data = stateData[stateName];
                  
                  const isHighlighted = !!data;
                  const isHovered = hoveredState === stateName;
                  const isActive = activeStateDetails === stateName;
                  
                  const fillColor = isActive 
                    ? "var(--accent-hover)" // active state
                    : isHovered 
                      ? (isHighlighted ? "var(--accent-hover)" : "var(--border-medium)") 
                      : (isHighlighted ? "var(--accent)" : "var(--bg-tertiary)");

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        setHoveredState(stateName);
                        if (data) {
                          setTooltip({
                            content: { name: stateName, ...data },
                            x: e.clientX,
                            y: e.clientY,
                          });
                        } else {
                          setTooltip({
                            content: { name: stateName, schemes: 0, partners: 0 },
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        setTooltip((prev) => ({
                          ...prev,
                          x: e.clientX,
                          y: e.clientY,
                        }));
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltip({ content: null, x: 0, y: 0 });
                      }}
                      onClick={() => handleStateClick(stateName, geo)}
                      fill={fillColor}
                      stroke={isActive || isHovered ? "var(--text-primary)" : "var(--text-secondary)"}
                      strokeWidth={isActive || isHovered ? 1 : 0.5}
                      style={{
                        outline: "none",
                        cursor: "pointer",
                        transition: "fill 0.2s ease, stroke-width 0.2s ease"
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Pulsing Markers for Active Hubs */}
            {Object.entries(stateData).map(([name, data]) => {
              if (!data.coords) return null;
              return (
                <Marker key={name} coordinates={data.coords}>
                  <circle r={4} fill="var(--bg-primary)" stroke="#111111" strokeWidth={1.5} />
                  <circle r={8} fill="none" stroke="var(--bg-primary)" strokeWidth={1} className={styles.pulseRing} />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Map Controls */}
      <div className={styles.mapControls}>
        <button className={styles.controlBtn} onClick={handleZoomIn} aria-label={t('map.zoomIn')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button className={styles.controlBtn} onClick={handleZoomOut} aria-label={t('map.zoomOut')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button className={styles.controlBtn} onClick={handleReset} aria-label={t('map.resetView')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        </button>
      </div>

      {/* Slide-out Detail Panel */}
      <div className={`${styles.detailPanel} ${activeStateDetails ? styles.panelOpen : ""}`}>
        {activeStateDetails && (
          <>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>{activeStateDetails}</h3>
              <button className={styles.panelClose} onClick={() => setActiveStateDetails(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className={styles.panelBody}>
              <div className={styles.panelStatGroup}>
                <div className={styles.panelStatBox}>
                  <div className={styles.panelStatValue}>{stateData[activeStateDetails]?.schemes || 0}</div>
                  <div className={styles.panelStatLabel}>{t('map.eligibleSchemes')}</div>
                </div>
                <div className={styles.panelStatBox}>
                  <div className={styles.panelStatValue}>{stateData[activeStateDetails]?.partners || 0}</div>
                  <div className={styles.panelStatLabel}>{t('map.channelPartners')}</div>
                </div>
              </div>

              {stateData[activeStateDetails]?.schemes > 0 && (
                <div className={styles.panelSection}>
                  <h4 className={styles.panelSectionTitle}>{t('map.topSchemes')}</h4>
                  <ul className={styles.schemeList}>
                    <li>Prime Minister's Employment Generation Programme (PMEGP)</li>
                    <li>Pradhan Mantri MUDRA Yojana (PMMY)</li>
                    <li>Stand-Up India Scheme</li>
                  </ul>
                  <button className={styles.panelActionBtn}>{t('map.viewAllIn')} {activeStateDetails} &rarr;</button>
                </div>
              )}
              
              {!stateData[activeStateDetails] && (
                <div className={styles.panelEmpty}>
                  {t('map.noNodeData')}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      <div
        className={`${styles.tooltip} ${tooltip.content && !activeStateDetails ? styles.visible : ""}`}
        style={{ left: tooltip.x, top: tooltip.y }}
      >
        {tooltip.content && (
          <>
            <div className={styles.tooltipTitle}>
              <span>{tooltip.content.name}</span>
              {tooltip.content.schemes > 0 && (
                <span style={{ color: 'var(--accent)' }}>{t('map.active')}</span>
              )}
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>{t('map.eligibleSchemes')}</span>
              <span className={styles.tooltipValue}>{tooltip.content.schemes}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>{t('map.channelPartners')}</span>
              <span className={styles.tooltipValue}>{tooltip.content.partners}</span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>{t('map.coverageStatus')}</div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'var(--accent)' }} />
          <span>{t('map.activeHub')} (6+ Schemes)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)' }} />
          <span>{t('map.noNodeDataLegend')}</span>
        </div>
      </div>
    </div>
  );
}
