import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Search,
  MapPin,
  LocateFixed,
  Check,
  MapPinOff,
  History,
  AlertCircle,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { DeliveryLocation } from "../types";
import { POPULAR_LOCATIONS, loadRecentLocations } from "../utils/locationStorage";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: DeliveryLocation | null;
  onSelectLocation: (location: DeliveryLocation) => void;
  onClearLocation: () => void;
}

export function LocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  onClearLocation,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<DeliveryLocation[]>(() =>
    loadRecentLocations()
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setGeoError(null);
    onClose();
  }, [onClose]);

  const handleClear = () => {
    onClearLocation();
    handleClose();
  };

  // Autofocus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Filter popular locations by search query
  const query = searchQuery.trim().toLowerCase();
  const filteredPopular = POPULAR_LOCATIONS.filter((loc) => {
    if (!query) return true;
    return (
      loc.city.toLowerCase().includes(query) ||
      loc.state.toLowerCase().includes(query) ||
      loc.displayName.toLowerCase().includes(query) ||
      (loc.pincode && loc.pincode.includes(query))
    );
  });

  const filteredRecents = recentLocations.filter((loc) => {
    if (!query) return true;
    return (
      loc.city.toLowerCase().includes(query) ||
      loc.displayName.toLowerCase().includes(query)
    );
  });

  // Explicit user-triggered browser Geolocation request
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser. Please select a city below.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      () => {
        // Explicitly avoid logging, storing, or exposing precise GPS coordinates.
        // Provide clean generic current location object for the demo.
        setIsLocating(false);
        const detectedLocation: DeliveryLocation = {
          id: "loc-current",
          label: "Current Location",
          city: "Current Location",
          state: "Mithila Region",
          displayName: "Current Location",
          isCurrentLocation: true,
        };
        onSelectLocation(detectedLocation);
        handleClose();
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location access was denied. Please pick your city from the list below.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError("Location information is currently unavailable. Please select your city manually.");
        } else if (error.code === error.TIMEOUT) {
          setGeoError("Location detection timed out. Please select your city below.");
        } else {
          setGeoError("Unable to detect current location. Please choose a city below.");
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSelect = (loc: DeliveryLocation) => {
    onSelectLocation(loc);
    setRecentLocations(loadRecentLocations());
    handleClose();
  };

  const hasAnyResults = filteredPopular.length > 0 || filteredRecents.length > 0;

  return (
    <div
      className="location-backdrop"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="location-modal-title"
    >
      <div
        className="location-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top pull-indicator */}
        <div className="location-sheet-handle" aria-hidden="true" />

        {/* Modal Header */}
        <div className="location-modal-header">
          <div>
            <h2 id="location-modal-title" className="location-modal-heading">
              Select delivery location
            </h2>
            <p className="location-modal-subheading">
              Choose your delivery area across Mithila and Bihar for accurate dispatch times.
            </p>
          </div>
          <button
            type="button"
            className="location-close-btn"
            onClick={handleClose}
            aria-label="Close location selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="location-search-container">
          <Search size={18} className="location-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="location-search-input"
            placeholder="Search city, area or pincode (e.g. Darbhanga, Patna)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search delivery locations"
          />
          {searchQuery && (
            <button
              type="button"
              className="location-search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* GPS Geolocation Action */}
        <div className="location-gps-action-wrapper">
          <button
            type="button"
            className={`location-gps-btn ${isLocating ? "location-gps-btn-loading" : ""}`}
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            <div className="location-gps-icon-box">
              {isLocating ? (
                <Loader2 size={18} className="spin-animation" />
              ) : (
                <LocateFixed size={18} />
              )}
            </div>
            <div className="location-gps-text">
              <span className="location-gps-title">
                {isLocating ? "Detecting location..." : "Use current location"}
              </span>
              <span className="location-gps-subtitle">
                Using browser location detection
              </span>
            </div>
          </button>

          {/* Graceful error message if permission is denied or unavailable */}
          {geoError && (
            <div className="location-gps-error" role="alert">
              <AlertCircle size={15} />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        <div className="location-modal-body">
          {/* Currently Selected Location Section */}
          {selectedLocation &&
            (!query ||
              selectedLocation.displayName.toLowerCase().includes(query) ||
              selectedLocation.label.toLowerCase().includes(query)) && (
              <div className="location-section location-selected-section">
                <div className="location-selected-header-row">
                  <div className="location-section-title">
                    <Check size={13} className="location-selected-check-icon" />
                    <span>Currently Selected</span>
                  </div>
                  <button
                    type="button"
                    className="location-clear-btn"
                    onClick={handleClear}
                    aria-label={`Clear selected location ${selectedLocation.displayName}`}
                    title="Remove selected location"
                  >
                    <Trash2 size={13} />
                    <span>Clear location</span>
                  </button>
                </div>

                <div className="location-selected-card">
                  <div className="location-item-icon location-selected-card-icon">
                    <MapPin size={16} />
                  </div>
                  <div className="location-item-details">
                    <div className="location-selected-card-title-row">
                      <span className="location-item-name">{selectedLocation.label}</span>
                      <span className="location-active-tag">Active</span>
                    </div>
                    <span className="location-item-sub">
                      {selectedLocation.displayName} {selectedLocation.pincode ? `• ${selectedLocation.pincode}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Recent Locations (shown when query is empty or matches) */}
          {filteredRecents.length > 0 && !query && (
            <div className="location-section">
              <div className="location-section-title">
                <History size={13} />
                <span>Recent Locations</span>
              </div>
              <div className="location-list">
                {filteredRecents.map((loc) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  return (
                    <button
                      key={`recent-${loc.id}`}
                      type="button"
                      className={`location-item-btn ${isSelected ? "location-item-selected" : ""}`}
                      onClick={() => handleSelect(loc)}
                      aria-label={`Select ${loc.displayName}`}
                    >
                      <div className="location-item-icon">
                        <MapPin size={16} />
                      </div>
                      <div className="location-item-details">
                        <span className="location-item-name">{loc.label}</span>
                        <span className="location-item-sub">{loc.displayName}</span>
                      </div>
                      {isSelected && (
                        <div className="location-selected-badge" title="Currently selected">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Popular Locations */}
          {filteredPopular.length > 0 && (
            <div className="location-section">
              <div className="location-section-title">
                <Sparkles size={13} />
                <span>{query ? "Matching Locations" : "Popular Locations"}</span>
              </div>
              <div className="location-list">
                {filteredPopular.map((loc) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      className={`location-item-btn ${isSelected ? "location-item-selected" : ""}`}
                      onClick={() => handleSelect(loc)}
                      aria-label={`Select ${loc.displayName}`}
                    >
                      <div className="location-item-icon">
                        <MapPin size={16} />
                      </div>
                      <div className="location-item-details">
                        <span className="location-item-name">{loc.label}</span>
                        <span className="location-item-sub">
                          {loc.displayName} {loc.pincode ? `• ${loc.pincode}` : ""}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="location-selected-badge" title="Currently selected">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clean Empty Search State */}
          {!hasAnyResults && (
            <div className="location-empty-state">
              <div className="location-empty-icon-box">
                <MapPinOff size={36} />
              </div>
              <h4 className="location-empty-heading">No matching locations found</h4>
              <p className="location-empty-text">
                We couldn't find any locations matching "<strong>{searchQuery}</strong>".
              </p>
              <button
                type="button"
                className="location-empty-reset-btn"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Demo Disclaimer Footer */}
        <div className="location-modal-footer">
          <span className="location-demo-note">
            Demo locations available for selection across Mithila & Bihar.
          </span>
        </div>
      </div>
    </div>
  );
}
