"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import styles from "./IndiaMap.module.css";
import { useTranslation } from "@/context/TranslationContext";
import { SCHEMES_DATABASE } from '@/data/schemes';
import { Scheme } from '@/types/assessment';
import SchemeDetailModal from './SchemeDetailModal';

const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/india-topojson.json";

// Keep some coords for pulsing dots in active states for visual flair
const STATE_COORDS: Record<string, [number, number]> = {
  "Maharashtra": [76.0, 19.5],
  "Gujarat": [71.5, 22.5],
  "Karnataka": [76.0, 14.5],
  "Uttar Pradesh": [80.5, 27.0],
  "Delhi": [77.1, 28.6],
  "Tamil Nadu": [78.5, 11.0],
  "Telangana": [79.0, 17.5],
};

const geoUrl = "/india-states.json";

export default function IndiaMap() {
  const [tooltip, setTooltip] = useState<{
    content: { name: string; schemes: number } | null;
    x: number;
    y: number;
  }>({ content: null, x: 0, y: 0 });

  const [isMounted, setIsMounted] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  const [position, setPosition] = useState({ coordinates: [80, 22] as [number, number], zoom: 1 });
  const [activeStateDetails, setActiveStateDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  const { t } = useTranslation();

  const centralSchemes = useMemo(() => SCHEMES_DATABASE.filter(s => !s.state), []);
  
  const getStateData = (stateName: string) => {
    const stateSchemes = SCHEMES_DATABASE.filter(s => s.state === stateName);
    const total = centralSchemes.length + stateSchemes.length;
    return {
      total,
      stateSchemes,
      centralSchemes
    };
  };

  const searchableStates = useMemo(() => {
    // Collect unique state names from TopoJSON (we will simulate a list since we can't easily parse TopoJSON synchronously here)
    // For now we will rely on a basic list of states for the search overlay.
    return [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
      "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ];
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

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

  const handleStateClick = (stateName: string) => {
    const coords = STATE_COORDS[stateName];
    if (coords) {
      setPosition({ coordinates: coords, zoom: 3 });
    }
    setActiveStateDetails(stateName);
  };

  const handleSearchSelect = (stateName: string) => {
    handleStateClick(stateName);
    setSearchQuery("");
    setIsSearching(false);
  };

  const searchResults = searchQuery.trim() 
    ? searchableStates.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className={styles.mapContainer}>
      
      <div className={styles.searchOverlay}>
        <div className={styles.searchInputWrapper}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder={t('map.searchPlaceholder') || 'Search states...'}
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

      <div className={styles.mapWrapper}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [80, 22] }}
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
                  const data = getStateData(stateName);
                  const isHovered = hoveredState === stateName;
                  const isActive = activeStateDetails === stateName;
                  
                  let fillClass = 'var(--bg-tertiary)';
                  if (data.total >= 6) fillClass = 'var(--accent)';
                  else if (data.total >= 3) fillClass = 'rgba(245, 184, 0, 0.7)';
                  else if (data.total >= 1) fillClass = 'rgba(245, 184, 0, 0.4)';

                  const fillColor = isActive 
                    ? "var(--accent-hover)" 
                    : isHovered ? "var(--accent-hover)" : fillClass;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        setHoveredState(stateName);
                        setTooltip({
                          content: { name: stateName, schemes: data.total },
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onMouseMove={(e) => {
                        setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltip({ content: null, x: 0, y: 0 });
                      }}
                      onClick={() => handleStateClick(stateName)}
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

            {Object.entries(STATE_COORDS).map(([name, coords]) => (
              <Marker key={name} coordinates={coords}>
                <circle r={4} fill="var(--bg-primary)" stroke="#111111" strokeWidth={1.5} />
                <circle r={8} fill="none" stroke="var(--bg-primary)" strokeWidth={1} className={styles.pulseRing} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className={styles.mapControls}>
        <button className={styles.controlBtn} onClick={handleZoomIn} aria-label={t('map.zoomIn') || 'Zoom In'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button className={styles.controlBtn} onClick={handleZoomOut} aria-label={t('map.zoomOut') || 'Zoom Out'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button className={styles.controlBtn} onClick={handleReset} aria-label={t('map.resetView') || 'Reset View'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        </button>
      </div>

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
                  <div className={styles.panelStatValue}>{getStateData(activeStateDetails).total}</div>
                  <div className={styles.panelStatLabel}>{t('map.eligibleSchemes') || 'Eligible Schemes'}</div>
                </div>
              </div>

              <div className={styles.panelSection}>
                <h4 className={styles.panelSectionTitle}>Central Government Schemes</h4>
                <div className={styles.schemeList}>
                  {getStateData(activeStateDetails).centralSchemes.map(s => (
                    <div key={s.id} className={styles.schemeCard} onClick={() => setSelectedScheme(s)}>
                      <h5 className={styles.schemeCardTitle}>{s.name}</h5>
                      <span className={styles.schemeCardMinistry}>{s.ministry || s.categoryTags?.[0] || 'Government of India'}</span>
                      <p className={styles.schemeCardPurpose}>{s.purpose || s.description || 'Details pending verification.'}</p>
                      {s.maxFundingAmount && <span className={styles.schemeCardAmount}>Max: ₹{formatAmount(s.maxFundingAmount)}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.panelSection}>
                <h4 className={styles.panelSectionTitle}>{activeStateDetails} State Schemes</h4>
                {getStateData(activeStateDetails).stateSchemes.length > 0 ? (
                  <div className={styles.schemeList}>
                    {getStateData(activeStateDetails).stateSchemes.map(s => (
                      <div key={s.id} className={styles.schemeCard} onClick={() => setSelectedScheme(s)}>
                        <h5 className={styles.schemeCardTitle}>{s.name}</h5>
                        <span className={styles.schemeCardMinistry}>{s.ministry || s.categoryTags?.[0] || 'State Government'}</span>
                        <p className={styles.schemeCardPurpose}>{s.purpose || s.description || 'Details pending verification.'}</p>
                        {s.maxFundingAmount && <span className={styles.schemeCardAmount}>Max: ₹{formatAmount(s.maxFundingAmount)}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.panelEmpty}>
                    State-specific schemes not yet available for {activeStateDetails}.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className={`${styles.tooltip} ${tooltip.content && !activeStateDetails ? styles.visible : ""}`}
        style={{ left: tooltip.x, top: tooltip.y }}
      >
        {tooltip.content && (
          <>
            <div className={styles.tooltipTitle}>
              <span>{tooltip.content.name}</span>
            </div>
            <div className={styles.tooltipRow}>
              <span className={styles.tooltipLabel}>{t('map.eligibleSchemes') || 'Schemes'}</span>
              <span className={styles.tooltipValue}>{tooltip.content.schemes}</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendTitle}>{t('map.coverageStatus') || 'Coverage'}</div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'var(--accent)' }} />
          <span>6+ Schemes</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'rgba(245, 184, 0, 0.7)' }} />
          <span>3-5 Schemes</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'rgba(245, 184, 0, 0.4)' }} />
          <span>1-2 Schemes</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-strong)' }} />
          <span>No data</span>
        </div>
      </div>

      {selectedScheme && (
        <SchemeDetailModal 
          scheme={selectedScheme} 
          onClose={() => setSelectedScheme(null)} 
        />
      )}
    </div>
  );
}
