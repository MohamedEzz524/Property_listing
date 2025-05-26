import { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaStar,
  FaUserFriends,
  FaBed,
  FaHeart,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

const Content = () => {
  // State management
  const [data, setData] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [superhost, setSuperhost] = useState(false);
  const [type, setType] = useState("");
  const [types, setTypes] = useState([]);

  // Add these new states for favorites
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("propertyFavorites")) || [];
    } catch {
      return [];
    }
  });

  // Toggle favorite status
  const toggleFavorite = (propertyId) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];

    setFavorites(newFavorites);
    localStorage.setItem("propertyFavorites", JSON.stringify(newFavorites));
  };

  // Get favorite properties
  const favoriteProperties = useMemo(
    () => data.filter((property) => favorites.includes(property.id)),
    [data, favorites]
  );

  // Memoized fetch function to prevent unnecessary recreations
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/Property_listing/properties.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
      setFiltered(jsonData);

      // Extract unique locations and types in a single pass
      const locationsSet = new Set();
      const typesSet = new Set();

      jsonData.forEach((entry) => {
        if (entry.location) locationsSet.add(entry.location);
        if (entry.capacity?.bedrooms) typesSet.add(entry.capacity.bedrooms);
      });

      // Convert to array with proper structure
      const locationsArray = Array.from(locationsSet).map((location) => ({
        location,
        filtered: false,
      }));

      setAvailableLocations(locationsArray);
      setTypes(Array.from(typesSet).sort((a, b) => a - b)); // Sort types numerically
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized filter function to optimize performance
  const applyFilters = useCallback(
    (locations = availableLocations, isSuperhost = superhost, bType = type) => {
      // First filter by location if any locations are selected
      let tempData = data;
      const activeLocations = locations.filter((loc) => loc.filtered);

      if (activeLocations.length > 0) {
        tempData = data.filter((d) =>
          activeLocations.some((loc) => loc.location === d.location)
        );
      }

      // Then filter by superhost if enabled
      if (isSuperhost) {
        tempData = tempData.filter((d) => d.superhost);
      }

      // Finally filter by bedroom type if selected
      if (bType) {
        tempData = tempData.filter(
          (d) => d.capacity?.bedrooms === parseInt(bType)
        );
      }

      setFiltered(tempData);
    },
    [data, availableLocations, superhost, type]
  );

  // Handler for location filter changes
  const handleAddFilterOption = (location) => {
    setAvailableLocations((prevLocations) =>
      location
        ? prevLocations.map((entry) =>
            entry.location === location
              ? { ...entry, filtered: !entry.filtered }
              : entry
          )
        : prevLocations.map((entry) => ({ ...entry, filtered: false }))
    );
  };

  // Handler for superhost toggle
  const handleSuperhost = () => {
    setSuperhost((prev) => !prev);
  };

  // Handler for property type selection
  const handleSelectType = (e) => {
    setType(e.target.value);
  };

  // Apply filters whenever relevant state changes
  useEffect(() => {
    applyFilters();
  }, [availableLocations, superhost, type, applyFilters]);

  // Memoized filtered data count to prevent unnecessary recalculations
  const filteredCount = useMemo(() => filtered.length, [filtered]);

  // Loading and error states
  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 dark:text-red-400">
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-3">⚠️</span>
          <p>Error loading data:</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="properties" className="relative scroll-mt-15">
      {/* Add floating favorites button */}

      <button
        onClick={() => setShowFavorites(true)}
        className="fixed right-4 bottom-4 bg-rose-500 text-white p-3 rounded-full shadow-lg z-40 hover:bg-rose-600 transition-colors flex items-center gap-2 cursor-pointer"
      >
        <FaHeart />
        <span className="font-medium">{favorites.length}</span>
      </button>

      {/* Favorites Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl shadow-xl transform ${
          showFavorites ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="p-4">
          <button
            onClick={() => setShowFavorites(false)}
            className="p-2 flex gap-1.5 items-center rounded-full dark:text-gray-500 text-gray-700 hover:bg-gray-400 dark:hover:bg-gray-900 cursor-pointer"
            aria-label="Close favorites"
          >
            <FaTimes className="text-xl" /> <span>Close</span>
          </button>
          {/* Title */}
          <div className="flex justify-center items-center pt-5 pb-2 border-b border-current">
            <h2 className="text-xl font-bold flex items-center gap-2 transition-colors duration-300 dark:text-gray-400 text-gray-600">
              <FaHeart className="text-rose-500" />
              Your Favorites: (
              <span className="text-amber-400">{favorites.length}</span>)
            </h2>
          </div>
          {/* Items */}
          {favoriteProperties.length > 0 ? (
            <div className="space-y-4 py-4">
              {favoriteProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={true}
                  onFavoriteToggle={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No favorites yet</p>
              <p className="text-sm mt-2">
                Click the heart icon to save properties
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Filter Bar */}

      <div className="container -translate-y-1/2 relative top-0 sm:top-0 z-10">
        <div
          className="backdrop-blur-lg min-h-30 shadow-lg rounded-lg p-4 z-20 max-md:w-full 
          bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700
          flex flex-col md:flex-row justify-center sm:justify-between items-center gap-4 transition-all duration-300 hover:shadow-xl"
        >
          {/* Mobile Filter Controls */}
          <div className="flex w-full justify-between items-center md:hidden">
            <h3 className="font-medium flex gap-1.5 items-center text-gray-700 dark:text-gray-300">
              <FaFilter />
              <div>Filters</div>
            </h3>
            <div className="flex gap-2">
              {/* Mobile Superhost Toggle */}
              <button
                onClick={handleSuperhost}
                className={`p-2 rounded-full cursor-pointer ${superhost ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-700"}`}
                aria-label="Toggle superhost"
              >
                <FaStar className="text-sm" />
              </button>

              {/* Mobile Type Selector */}
              <div className="relative">
                <select
                  value={type}
                  onChange={handleSelectType}
                  className="appearance-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="">Type</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type} bed
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-3 h-3 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Location Filters - Scrollable on mobile */}

          <div className="flex max-w-full gap-2 p-2 overflow-x-auto">
            {/* All Stays Option */}
            <FilterPill
              id="all"
              label="All"
              checked={!availableLocations.some((loc) => loc.filtered)}
              onChange={() => handleAddFilterOption(false)}
              mobile
            />

            {/* Location Options */}
            {availableLocations.map((obj) => (
              <FilterPill
                key={obj.location}
                id={obj.location}
                label={obj.location.split(" ")[0]} // Show only first word on mobile
                fullLabel={obj.location} // Full label for tooltip
                checked={obj.filtered}
                onChange={() => handleAddFilterOption(obj.location)}
                mobile
              />
            ))}
          </div>

          {/* Additional Filters - Hidden on mobile */}
          <div className="hidden md:flex gap-4 items-center text-gray-800 dark:text-gray-200 p-2">
            {/* Superhost Toggle */}
            <div className="flex items-center gap-2">
              <ToggleSwitch
                id="superhost"
                checked={superhost}
                onChange={handleSuperhost}
              />
              <label
                htmlFor="superhost"
                className="text-sm font-medium cursor-pointer"
              >
                Superhost
              </label>
            </div>

            {/* Property Type Selector */}
            <div className="relative py-2">
              <select
                value={type}
                onChange={handleSelectType}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">Property Type</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type} bedroom{type !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container py-5">
        <h2 className="text-xl py-4 mb-2.5 text-gray-800 dark:text-gray-200">
          Over{" "}
          <span className="text-amber-600 dark:text-amber-400 text-2xl font-medium">
            {filteredCount}
          </span>{" "}
          Stays
        </h2>

        {/* Property Grid */}
        {filteredCount > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((property) => (
              <PropertyCard
                key={property.id || property.title}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

// Extracted components for better readability and reusability

const FilterPill = ({ id, label, fullLabel, checked, onChange, mobile }) => (
  <div className="flex items-center">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="appearance-none hidden w-full bg-transparent focus:outline-none peer"
    />
    <label
      htmlFor={id}
      className={`inline-block py-1.5 px-3 md:py-2 md:px-4 rounded-full cursor-pointer transition-all duration-200 text-sm md:text-base
        ${
          checked
            ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400 ring-offset-2 ring-offset-white/80 dark:ring-offset-gray-900/80"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      title={fullLabel || label} // Show full label as tooltip on mobile
    >
      {mobile && label.length > 8 ? `${label.substring(0, 6)}...` : label}
    </label>
  </div>
);

const ToggleSwitch = ({ id, checked, onChange }) => (
  <div className="relative inline-block w-10 align-middle select-none">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div
      className={`block w-10 h-6 rounded-full transition-colors duration-200
      ${checked ? "bg-amber-600" : "bg-gray-300 dark:bg-gray-600"}`}
    ></div>
    <div
      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200
      ${checked ? "transform translate-x-4" : ""}`}
    ></div>
  </div>
);

const PropertyCard = ({ property, isFavorite, onFavoriteToggle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
    {/* Image with superhost badge */}
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={property.image}
        alt={property.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {property.superhost && (
        <div className="absolute flex items-center gap-1.5 text-xs top-3 left-3 py-1 px-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full shadow-md">
          <FaStar className="text-amber-400" />
          <span className="font-medium">Superhost</span>
        </div>
      )}

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFavoriteToggle?.(property.id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors z-[5] cursor-pointer ${
          isFavorite
            ? "bg-rose-500 text-white"
            : "bg-white/90 text-gray-800 hover:bg-gray-100"
        }`}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <FaHeart className={isFavorite ? "fill-current" : ""} />
      </button>
    </div>

    {/* Property details */}
    <div className="p-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate mb-1">
          {property.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
          {property.description}
        </p>

        {/* Capacity info */}
        <div className="flex gap-4 mt-3 text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center gap-1.5">
            <FaBed className="opacity-70" />
            <span>
              {property.capacity?.bedrooms || 1} bed
              {property.capacity?.bedrooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaUserFriends className="opacity-70" />
            <span>
              {property.capacity?.people || 1} guest
              {property.capacity?.people !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Price and rating */}
      <div className="flex justify-between items-center">
        <div className="font-medium text-gray-800 dark:text-white">
          <span className="text-amber-600 dark:text-amber-400">
            ${property.price}
          </span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
            /night
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FaStar className="text-amber-400" />
          <span className="text-gray-700 dark:text-gray-300">
            {property.rating}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
    <div className="text-5xl mb-4 text-gray-400 dark:text-gray-500">🏠</div>
    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
      No properties found
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm">
      Try adjusting your filters
    </p>
  </div>
);

export default Content;
