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
  Home,
  Briefcase,
  Plus,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import type { Address, AddressLabel, DeliveryLocation } from "../types";
import { POPULAR_LOCATIONS, loadRecentLocations } from "../utils/locationStorage";
import {
  ADDRESS_STORAGE_KEY,
  loadSavedAddresses,
  saveAddresses,
  saveSelectedAddressId,
  addressToDeliveryLocation,
  validateAddress,
} from "../utils/addressStorage";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: DeliveryLocation | null;
  onSelectLocation: (location: DeliveryLocation) => void;
  onClearLocation: () => void;
}

interface AddressFormData {
  label: AddressLabel;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

const INITIAL_FORM_DATA: AddressFormData = {
  label: "Home",
  fullName: "",
  phone: "",
  house: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

export function LocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  onClearLocation,
}: LocationModalProps) {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<"saved" | "cities">("saved");
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Address data & form state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(() =>
    loadSavedAddresses()
  );
  const [formData, setFormData] = useState<AddressFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick Cities Search & Geolocation state
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<DeliveryLocation[]>(() =>
    loadRecentLocations()
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setGeoError(null);
    setMode("list");
    setEditingAddress(null);
    setConfirmDeleteId(null);
    setErrors({});
    onClose();
  }, [onClose]);

  const handleClear = () => {
    saveSelectedAddressId(null);
    onClearLocation();
    handleClose();
  };

  // Sync addresses on storage changes across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === ADDRESS_STORAGE_KEY) {
        setSavedAddresses(loadSavedAddresses());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Autofocus when switching views
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "form") {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else if (activeTab === "cities") {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, activeTab]);

  // Handle Escape key to close modal or go back
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode === "form") {
          setMode("list");
          setEditingAddress(null);
          setErrors({});
        } else if (confirmDeleteId) {
          setConfirmDeleteId(null);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mode, confirmDeleteId, handleClose]);

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

  const hasAnyCityResults = filteredPopular.length > 0 || filteredRecents.length > 0;

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
        setIsLocating(false);
        const detectedLocation: DeliveryLocation = {
          id: "loc-current",
          label: "Current Location",
          city: "Current Location",
          state: "Mithila Region",
          displayName: "Current Location",
          isCurrentLocation: true,
        };
        saveSelectedAddressId(null);
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

  const handleSelectCity = (loc: DeliveryLocation) => {
    saveSelectedAddressId(null);
    onSelectLocation(loc);
    setRecentLocations(loadRecentLocations());
    handleClose();
  };

  // Address Actions
  const handleSelectAddress = (address: Address) => {
    saveSelectedAddressId(address.id);
    onSelectLocation(addressToDeliveryLocation(address));
    handleClose();
  };

  const handleStartAdd = () => {
    setEditingAddress(null);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setMode("form");
  };

  const handleStartEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      house: address.house,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
    });
    setErrors({});
    setMode("form");
  };

  const handleConfirmDelete = (id: string) => {
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    saveAddresses(updated);
    setConfirmDeleteId(null);

    const isCurrentlySelected =
      selectedLocation?.address?.id === id ||
      selectedLocation?.id === id ||
      selectedLocation?.id === `addr-${id}`;

    if (isCurrentlySelected) {
      if (updated.length > 0) {
        const nextAddr = updated[0];
        saveSelectedAddressId(nextAddr.id);
        onSelectLocation(addressToDeliveryLocation(nextAddr));
      } else {
        saveSelectedAddressId(null);
        onClearLocation();
      }
    }
  };

  const handleChangeField = <K extends keyof AddressFormData>(
    key: K,
    value: AddressFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAddress(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editingAddress) {
      // Preserve existing id!
      const updated: Address = {
        id: editingAddress.id,
        label: formData.label,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        house: formData.house.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        landmark: formData.landmark.trim() || undefined,
      };

      const nextList = savedAddresses.map((a) =>
        a.id === editingAddress.id ? updated : a
      );
      setSavedAddresses(nextList);
      saveAddresses(nextList);

      const isSelected =
        selectedLocation?.address?.id === updated.id ||
        selectedLocation?.id === updated.id ||
        selectedLocation?.id === `addr-${updated.id}`;

      if (isSelected) {
        onSelectLocation(addressToDeliveryLocation(updated));
      }

      setMode("list");
      setEditingAddress(null);
      setErrors({});
    } else {
      // Adding new address
      const newAddr: Address = {
        id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        label: formData.label,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        house: formData.house.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        landmark: formData.landmark.trim() || undefined,
      };

      const nextList = [newAddr, ...savedAddresses];
      setSavedAddresses(nextList);
      saveAddresses(nextList);

      // Auto-select newly created address
      saveSelectedAddressId(newAddr.id);
      onSelectLocation(addressToDeliveryLocation(newAddr));

      setMode("list");
      setEditingAddress(null);
      setErrors({});
      handleClose();
    }
  };

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
              {mode === "form"
                ? editingAddress
                  ? "Edit Delivery Address"
                  : "Add New Address"
                : "Select delivery address"}
            </h2>
            <p className="location-modal-subheading">
              {mode === "form"
                ? "Enter accurate details for swift doorstep delivery."
                : "Choose a saved address or city for accurate 10-15 min dispatch."}
            </p>
          </div>
          <button
            type="button"
            className="location-close-btn"
            onClick={handleClose}
            aria-label="Close address selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switching: Only shown when in list mode */}
        {mode === "list" && (
          <div className="location-modal-tabs" role="tablist" aria-label="Location views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "saved"}
              className={`location-tab-btn ${
                activeTab === "saved" ? "location-tab-active" : ""
              }`}
              onClick={() => {
                setActiveTab("saved");
                setConfirmDeleteId(null);
              }}
            >
              <Home size={15} />
              <span>Saved Addresses</span>
              {savedAddresses.length > 0 && (
                <span className="location-tab-badge">{savedAddresses.length}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "cities"}
              className={`location-tab-btn ${
                activeTab === "cities" ? "location-tab-active" : ""
              }`}
              onClick={() => {
                setActiveTab("cities");
                setConfirmDeleteId(null);
              }}
            >
              <MapPin size={15} />
              <span>Quick Cities & GPS</span>
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="location-modal-body">
          {/* ========================================================
              VIEW 1: ADD / EDIT ADDRESS FORM
              ======================================================== */}
          {mode === "form" ? (
            <div className="address-form-wrapper">
              <button
                type="button"
                className="address-form-back-btn"
                onClick={() => {
                  setMode("list");
                  setEditingAddress(null);
                  setErrors({});
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Saved Addresses</span>
              </button>

              <form className="address-form" onSubmit={handleSaveForm} noValidate>
                {/* 1. Address Label / Type Selector */}
                <div className="address-form-group">
                  <label className="address-form-label">
                    Address Label <span className="address-required-mark">*</span>
                  </label>
                  <div
                    className="address-type-selector"
                    role="radiogroup"
                    aria-label="Address Label"
                  >
                    {(["Home", "Work", "Other"] as AddressLabel[]).map(
                      (labelOption) => (
                        <button
                          key={labelOption}
                          type="button"
                          role="radio"
                          aria-checked={formData.label === labelOption}
                          className={`address-type-btn ${
                            formData.label === labelOption
                              ? "address-type-btn-active"
                              : ""
                          }`}
                          onClick={() => handleChangeField("label", labelOption)}
                        >
                          {labelOption === "Home" && <Home size={14} />}
                          {labelOption === "Work" && <Briefcase size={14} />}
                          {labelOption === "Other" && <MapPin size={14} />}
                          <span>{labelOption}</span>
                        </button>
                      )
                    )}
                  </div>
                  {errors.label && (
                    <span className="address-field-error" role="alert">
                      {errors.label}
                    </span>
                  )}
                </div>

                {/* 2. Full Name & Phone Number */}
                <div className="address-form-grid-2">
                  <div className="address-form-group">
                    <label htmlFor="address-fullName" className="address-form-label">
                      Full Name <span className="address-required-mark">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="address-fullName"
                      name="fullName"
                      type="text"
                      className={`address-form-input ${
                        errors.fullName ? "address-input-error" : ""
                      }`}
                      placeholder="e.g. Piyush Kumar"
                      value={formData.fullName}
                      onChange={(e) => handleChangeField("fullName", e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(errors.fullName)}
                    />
                    {errors.fullName && (
                      <span className="address-field-error" role="alert">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="address-phone" className="address-form-label">
                      10-Digit Mobile <span className="address-required-mark">*</span>
                    </label>
                    <div className="address-phone-wrapper">
                      <span className="address-phone-prefix">+91</span>
                      <input
                        id="address-phone"
                        name="phone"
                        type="tel"
                        maxLength={10}
                        className={`address-form-input address-phone-field ${
                          errors.phone ? "address-input-error" : ""
                        }`}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          handleChangeField("phone", digits);
                        }}
                        aria-required="true"
                        aria-invalid={Boolean(errors.phone)}
                      />
                    </div>
                    {errors.phone && (
                      <span className="address-field-error" role="alert">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. House / Flat / Floor / Building */}
                <div className="address-form-group">
                  <label htmlFor="address-house" className="address-form-label">
                    House / Flat / Building <span className="address-required-mark">*</span>
                  </label>
                  <input
                    id="address-house"
                    name="house"
                    type="text"
                    className={`address-form-input ${
                      errors.house ? "address-input-error" : ""
                    }`}
                    placeholder="e.g. Flat 204, ABC Residency"
                    value={formData.house}
                    onChange={(e) => handleChangeField("house", e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.house)}
                  />
                  {errors.house && (
                    <span className="address-field-error" role="alert">
                      {errors.house}
                    </span>
                  )}
                </div>

                {/* 4. Locality / Street */}
                <div className="address-form-group">
                  <label htmlFor="address-street" className="address-form-label">
                    Locality / Street <span className="address-required-mark">*</span>
                  </label>
                  <input
                    id="address-street"
                    name="street"
                    type="text"
                    className={`address-form-input ${
                      errors.street ? "address-input-error" : ""
                    }`}
                    placeholder="e.g. Knowledge Park III"
                    value={formData.street}
                    onChange={(e) => handleChangeField("street", e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors.street)}
                  />
                  {errors.street && (
                    <span className="address-field-error" role="alert">
                      {errors.street}
                    </span>
                  )}
                </div>

                {/* 5. City & State (2 columns) */}
                <div className="address-form-grid-2">
                  <div className="address-form-group">
                    <label htmlFor="address-city" className="address-form-label">
                      City <span className="address-required-mark">*</span>
                    </label>
                    <input
                      id="address-city"
                      name="city"
                      type="text"
                      className={`address-form-input ${
                        errors.city ? "address-input-error" : ""
                      }`}
                      placeholder="e.g. Greater Noida"
                      value={formData.city}
                      onChange={(e) => handleChangeField("city", e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(errors.city)}
                    />
                    {errors.city && (
                      <span className="address-field-error" role="alert">
                        {errors.city}
                      </span>
                    )}
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="address-state" className="address-form-label">
                      State <span className="address-required-mark">*</span>
                    </label>
                    <input
                      id="address-state"
                      name="state"
                      type="text"
                      className={`address-form-input ${
                        errors.state ? "address-input-error" : ""
                      }`}
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.state}
                      onChange={(e) => handleChangeField("state", e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(errors.state)}
                    />
                    {errors.state && (
                      <span className="address-field-error" role="alert">
                        {errors.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* 6. Pincode & Landmark (2 columns) */}
                <div className="address-form-grid-2">
                  <div className="address-form-group">
                    <label htmlFor="address-pincode" className="address-form-label">
                      Pincode <span className="address-required-mark">*</span>
                    </label>
                    <input
                      id="address-pincode"
                      name="pincode"
                      type="text"
                      maxLength={6}
                      className={`address-form-input ${
                        errors.pincode ? "address-input-error" : ""
                      }`}
                      placeholder="e.g. 201306"
                      value={formData.pincode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                        handleChangeField("pincode", digits);
                      }}
                      aria-required="true"
                      aria-invalid={Boolean(errors.pincode)}
                    />
                    {errors.pincode && (
                      <span className="address-field-error" role="alert">
                        {errors.pincode}
                      </span>
                    )}
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="address-landmark" className="address-form-label">
                      Landmark <span className="address-optional-mark">(Optional)</span>
                    </label>
                    <input
                      id="address-landmark"
                      name="landmark"
                      type="text"
                      className="address-form-input"
                      placeholder="e.g. Near Metro Station"
                      value={formData.landmark}
                      onChange={(e) => handleChangeField("landmark", e.target.value)}
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="address-form-actions">
                  <button
                    type="button"
                    className="address-form-cancel-btn"
                    onClick={() => {
                      setMode("list");
                      setEditingAddress(null);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="address-form-submit-btn">
                    {editingAddress ? "Save Address" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === "saved" ? (
            /* ========================================================
               VIEW 2: SAVED ADDRESSES LIST
               ======================================================== */
            <div className="address-saved-container">
              {/* + Add New Address Action Bar */}
              <button
                type="button"
                className="address-add-new-btn"
                onClick={handleStartAdd}
                aria-label="Add a new delivery address"
              >
                <div className="address-add-icon-box">
                  <Plus size={18} />
                </div>
                <div className="address-add-text-box">
                  <span className="address-add-btn-title">+ Add New Address</span>
                  <span className="address-add-btn-sub">
                    Save flat, building, or office for quicker ordering
                  </span>
                </div>
              </button>

              {/* Saved Addresses List / Empty State */}
              {savedAddresses.length === 0 ? (
                <div className="address-empty-state">
                  <div className="address-empty-icon-box">
                    <MapPin size={34} />
                  </div>
                  <h4 className="address-empty-title">No saved addresses yet</h4>
                  <p className="address-empty-subtitle">
                    Add an address for faster checkout.
                  </p>
                  <button
                    type="button"
                    className="address-empty-add-btn"
                    onClick={handleStartAdd}
                  >
                    <Plus size={15} />
                    <span>+ Add New Address</span>
                  </button>
                  <span className="address-empty-hint">
                    Add your first delivery address
                  </span>
                </div>
              ) : (
                <div className="address-list-section">
                  <div className="address-list-header-row">
                    <span className="address-list-title">SAVED ADDRESSES</span>
                    <span className="address-list-count">
                      {savedAddresses.length}{" "}
                      {savedAddresses.length === 1 ? "address" : "addresses"}
                    </span>
                  </div>

                  <div className="address-cards-stack">
                    {savedAddresses.map((addr) => {
                      const isSelected =
                        selectedLocation?.address?.id === addr.id ||
                        selectedLocation?.id === addr.id ||
                        selectedLocation?.id === `addr-${addr.id}`;

                      const isConfirmingDelete = confirmDeleteId === addr.id;

                      return (
                        <div
                          key={addr.id}
                          className={`address-card ${
                            isSelected ? "address-card-selected" : ""
                          }`}
                        >
                          {isConfirmingDelete ? (
                            /* Delete Confirmation Inline Prompt */
                            <div className="address-delete-confirm-box" role="alert">
                              <div className="address-delete-confirm-info">
                                <span className="address-delete-confirm-title">
                                  Delete this address?
                                </span>
                                <span className="address-delete-confirm-desc">
                                  This address will be removed from your saved addresses.
                                </span>
                              </div>
                              <div className="address-delete-confirm-buttons">
                                <button
                                  type="button"
                                  className="address-confirm-cancel-btn"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="address-confirm-delete-btn"
                                  onClick={() => handleConfirmDelete(addr.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Regular Address Card */
                            <>
                              <div className="address-card-top-row">
                                <div className="address-label-chip">
                                  {addr.label === "Home" && (
                                    <Home size={13} className="address-label-icon" />
                                  )}
                                  {addr.label === "Work" && (
                                    <Briefcase size={13} className="address-label-icon" />
                                  )}
                                  {addr.label === "Other" && (
                                    <MapPin size={13} className="address-label-icon" />
                                  )}
                                  <span className="address-label-name">{addr.label}</span>
                                </div>
                                {isSelected && (
                                  <div
                                    className="address-selected-badge"
                                    title="Active delivery address"
                                  >
                                    <Check size={12} />
                                    <span>Selected</span>
                                  </div>
                                )}
                              </div>

                              <div
                                className="address-card-content"
                                onClick={() => handleSelectAddress(addr)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelectAddress(addr);
                                  }
                                }}
                                aria-label={`Select ${addr.label} address for ${addr.fullName}`}
                              >
                                <div className="address-card-recipient-row">
                                  <span className="address-card-recipient">
                                    {addr.fullName}
                                  </span>
                                  <span className="address-card-phone">
                                    +91 {addr.phone}
                                  </span>
                                </div>
                                <div className="address-card-location-details">
                                  <p className="address-card-house">
                                    {addr.house}
                                  </p>
                                  <p className="address-card-street">
                                    {addr.street}
                                  </p>
                                  <p className="address-card-city">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                  {addr.landmark && (
                                    <p className="address-card-landmark">
                                      <span className="landmark-tag">Landmark:</span>{" "}
                                      {addr.landmark}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="address-card-footer">
                                <div className="address-card-management-actions">
                                  <button
                                    type="button"
                                    className="address-btn-edit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEdit(addr);
                                    }}
                                    aria-label={`Edit ${addr.label} address`}
                                  >
                                    <Pencil size={13} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="address-btn-delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(addr.id);
                                    }}
                                    aria-label={`Delete ${addr.label} address`}
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                                {!isSelected && (
                                  <button
                                    type="button"
                                    className="address-btn-deliver"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectAddress(addr);
                                    }}
                                    aria-label={`Deliver to ${addr.label} address`}
                                  >
                                    Deliver Here
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================
               VIEW 3: QUICK CITIES & GPS
               ======================================================== */
            <div className="location-cities-container">
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
                  className={`location-gps-btn ${
                    isLocating ? "location-gps-btn-loading" : ""
                  }`}
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

                {geoError && (
                  <div className="location-gps-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{geoError}</span>
                  </div>
                )}
              </div>

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
                          <span className="location-item-name">
                            {selectedLocation.label}
                          </span>
                          <span className="location-active-tag">Active</span>
                        </div>
                        <span className="location-item-sub">
                          {selectedLocation.displayName}{" "}
                          {selectedLocation.pincode
                            ? `• ${selectedLocation.pincode}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Recent Locations */}
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
                          className={`location-item-btn ${
                            isSelected ? "location-item-selected" : ""
                          }`}
                          onClick={() => handleSelectCity(loc)}
                          aria-label={`Select ${loc.displayName}`}
                        >
                          <div className="location-item-icon">
                            <MapPin size={16} />
                          </div>
                          <div className="location-item-details">
                            <span className="location-item-name">{loc.label}</span>
                            <span className="location-item-sub">
                              {loc.displayName}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className="location-selected-badge"
                              title="Currently selected"
                            >
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
                    <span>
                      {query ? "Matching Locations" : "Popular Locations"}
                    </span>
                  </div>
                  <div className="location-list">
                    {filteredPopular.map((loc) => {
                      const isSelected = selectedLocation?.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          className={`location-item-btn ${
                            isSelected ? "location-item-selected" : ""
                          }`}
                          onClick={() => handleSelectCity(loc)}
                          aria-label={`Select ${loc.displayName}`}
                        >
                          <div className="location-item-icon">
                            <MapPin size={16} />
                          </div>
                          <div className="location-item-details">
                            <span className="location-item-name">{loc.label}</span>
                            <span className="location-item-sub">
                              {loc.displayName}{" "}
                              {loc.pincode ? `• ${loc.pincode}` : ""}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className="location-selected-badge"
                              title="Currently selected"
                            >
                              <Check size={14} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty Search State */}
              {!hasAnyCityResults && (
                <div className="location-empty-state">
                  <div className="location-empty-icon-box">
                    <MapPinOff size={36} />
                  </div>
                  <h4 className="location-empty-heading">
                    No matching locations found
                  </h4>
                  <p className="location-empty-text">
                    We couldn't find any locations matching "
                    <strong>{searchQuery}</strong>".
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
          )}
        </div>

        {/* Footer Note */}
        <div className="location-modal-footer">
          <span className="location-demo-note">
            Fast doorstep delivery across Mithila & Bihar.
          </span>
        </div>
      </div>
    </div>
  );
}
